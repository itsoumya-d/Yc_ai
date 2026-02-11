# SkillBridge -- Features

## Feature Roadmap Overview

| Phase | Timeline | Theme | Key Deliverables |
| ----- | -------- | ----- | ---------------- |
| **MVP Phase 1** | Months 1-3 | Foundation | Skills assessment, career explorer, basic UI |
| **MVP Phase 2** | Months 4-6 | Intelligence | AI resume rewriter, learning plans, job matching |
| **Post-MVP Phase 3** | Months 7-9 | Community | Mentor matching, forums, employer partnerships |
| **Post-MVP Phase 4** | Months 10-12 | Scale | Government pilots, interview prep, advanced tracking |
| **Year 2+** | Months 13+ | Expansion | B2B2C, international, credential verification, API |

---

## MVP Features (Months 1-6)

### 1. Skills Assessment

**Priority:** P0 (Core)
**Timeline:** Month 1-2
**Description:** The entry point for every user. Two paths to identify transferable skills: upload a resume (PDF) or answer a guided questionnaire. The AI extracts and categorizes skills, mapping them to standardized O*NET taxonomy codes.

**Functional Requirements:**

- Resume upload (PDF, DOCX, max 10MB)
- PDF text extraction and cleanup using Edge Function
- OpenAI GPT-4 Turbo structured output for skills extraction
- Alternative: guided questionnaire (15-20 questions covering work history, daily tasks, tools used, certifications)
- Skills mapped to O*NET SOC codes and ESCO framework
- Proficiency levels assigned: beginner, intermediate, advanced, expert
- Skills categorized: technical, interpersonal, analytical, physical, creative, managerial
- User can review, edit, add, and remove identified skills
- Progress saved at every step (no data loss if user leaves mid-assessment)

**User Stories:**

- As Maria (factory worker), I want to upload my resume so the AI can tell me what skills I have that I didn't know were valuable.
- As James (retail manager), I want to answer questions about my daily work so SkillBridge can identify my leadership and operations skills even though my resume is outdated.
- As Priya (admin assistant), I want to add skills that the AI missed, like my advanced Excel pivot table expertise.
- As Carlos (truck driver), I want to complete the assessment on my phone during a rest stop, saving my progress so I can finish later.

**Edge Cases:**

- Resume with no extractable text (scanned image PDF): show error, offer questionnaire path
- Resume in non-English language: detect language, inform user English is currently required, log for future i18n
- Very short resume (less than 50 words): supplement with questionnaire questions
- Very long resume (10+ pages): truncate to first 5 pages, inform user
- User has no resume at all: questionnaire is the primary path, no resume required
- Multiple careers in history: identify skills from all roles, weigh recent roles higher

**Technical Notes:**

- PDF parsing via pdf-parse library in Supabase Edge Function
- Structured output schema defined with Zod for type-safe AI responses
- Skills data stored in normalized tables: skills_profiles -> skills (one-to-many)
- Assessment state persisted to Supabase on every step change

**Acceptance Criteria:**

- [ ] User can upload a PDF or DOCX resume (up to 10 MB) and receive extracted skills within 15 seconds (p95)
- [ ] AI identifies a minimum of 5 skills from any resume with 50+ words of extractable text
- [ ] Each extracted skill is mapped to at least one O*NET SOC code with a proficiency level assigned
- [ ] Users can add, edit, or remove skills post-extraction with changes persisting within 500 ms
- [ ] Questionnaire path produces equivalent skill output to resume path for the same user profile
- [ ] Progress is auto-saved on every step; refreshing the browser at any point resumes from the last completed step
- [ ] Page achieves Lighthouse accessibility score >= 90 and supports keyboard-only navigation throughout the assessment flow
- [ ] SSR landing page for the assessment entry point achieves LCP < 2.5 s and CLS < 0.1

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| PDF has no extractable text (scanned image) | "We couldn't read this file. It may be a scanned image. Try the questionnaire instead." | No | Redirect to questionnaire path |
| PDF parsing timeout (> 30 s) | "Processing is taking longer than expected. Please try again." | Yes (1 automatic retry) | Offer questionnaire path |
| OpenAI API error / timeout | "Our AI is temporarily unavailable. Your file has been saved and we'll process it shortly." | Yes (queued background retry) | Show manual skill entry form |
| File exceeds 10 MB limit | "File is too large (max 10 MB). Please reduce the file size or use the questionnaire." | No | Offer questionnaire path |
| Unsupported file format | "Only PDF and DOCX files are supported. Please upload a supported format." | No | Offer questionnaire path |
| Non-English resume detected | "We currently support English resumes only. Multi-language support is coming soon." | No | Offer questionnaire in English |
| Supabase write failure | "We couldn't save your progress. Please check your connection and try again." | Yes (auto-retry 3x with exponential backoff) | Local storage backup with sync on reconnect |
| O*NET API unavailable | "Skills mapping is temporarily delayed. Your skills have been saved." | Yes (background retry) | Store raw skills; map when API recovers |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| resume_file | File (binary) | No (if questionnaire) | 1 KB / 10 MB | `.pdf`, `.docx` extensions; MIME type validation | Virus scan via ClamAV in Edge Function; strip embedded scripts |
| skill_name | String | Yes | 2 / 100 chars | `^[a-zA-Z0-9\s\-\+\#\.\/]+$` | HTML entity encoding, trim whitespace |
| proficiency_level | Enum | Yes | — | `beginner`, `intermediate`, `advanced`, `expert` | Reject invalid values |
| skill_category | Enum | Yes | — | `technical`, `interpersonal`, `analytical`, `physical`, `creative`, `managerial` | Reject invalid values |
| onet_soc_code | String | Yes | 7 / 10 chars | `^\d{2}-\d{4}(\.\d{2})?$` | Validate against O*NET database lookup |
| questionnaire_answer | String | Yes (per question) | 1 / 2000 chars | Free text | HTML entity encoding, strip tags, trim |
| user_id | UUID | Yes | 36 / 36 chars | UUID v4 format | Validate against auth session |

---

### 2. Transferable Skills Mapper

**Priority:** P0 (Core)
**Timeline:** Month 2-3
**Description:** The AI engine that takes a user's identified skills and maps them to new career opportunities. This is the core intellectual property of SkillBridge. It answers the question: "What can I do with what I already know?"

**Functional Requirements:**

- Cross-reference user skills against O*NET occupation requirements database (900+ occupations)
- Calculate transferability score: percentage of required skills for a target occupation that the user already possesses
- Identify skills gaps: specific skills needed for the target career that the user lacks
- Factor in proficiency levels (having a skill at "beginner" is different from "expert")
- Consider adjacent skills: skills that are closely related and can be quickly leveled up
- Weight skills by importance to the target occupation (critical vs nice-to-have)
- Account for soft skills / interpersonal skills transferability
- Display results in intuitive skill-to-career mapping visualization

**Algorithm Overview:**

```
For each target_occupation in O*NET database:
  required_skills = get_required_skills(target_occupation)
  user_skills = get_user_skills(user_profile)

  For each required_skill:
    exact_match = find_exact_match(user_skills, required_skill)
    adjacent_match = find_adjacent_skills(user_skills, required_skill)
    proficiency_factor = calculate_proficiency_weight(match, required_level)

    skill_score = (exact_match * 1.0 + adjacent_match * 0.6) * proficiency_factor

  transferability_score = sum(skill_scores) / sum(required_skill_weights)
  skills_gap = required_skills - matched_skills
  upskill_time_estimate = estimate_learning_time(skills_gap)

  Rank occupations by: transferability_score * growth_outlook * salary_potential
```

**User Stories:**

- As Maria, I want to see that my quality inspection skills transfer to data quality analyst roles at 72% match so I feel confident I'm not starting from zero.
- As James, I want to understand exactly which skills I'm missing for a project management career so I can focus my learning.

**Acceptance Criteria:**

- [ ] Mapping engine processes a user's skill profile against 900+ O*NET occupations and returns ranked results within 10 seconds (p95)
- [ ] Each target occupation shows a transferability score (0-100%), skills gap list, and estimated upskilling time
- [ ] Adjacent skill matching identifies at least 2 related skills per gap with a 0.6 weighting factor applied
- [ ] Proficiency levels are factored into scores (beginner match scores lower than expert match for the same skill)
- [ ] Results are deterministic: the same skill profile produces the same ranking on repeated runs
- [ ] SSR meta tags are generated per career path URL for SEO indexability (title, description, Open Graph)
- [ ] Mapping visualization renders in under 3 seconds on a 4G mobile connection and meets WCAG 2.1 AA contrast ratios

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| O*NET database query timeout | "Career matching is taking longer than usual. Please wait..." | Yes (auto-retry 2x) | Show cached results from last successful run |
| User has fewer than 3 identified skills | "We need more information to find career matches. Complete a few more assessment questions." | No | Redirect to assessment with pre-filled progress |
| Algorithm returns zero matches above 20% | "We're expanding your search to include more career paths." | No | Lower threshold to 10% and include foundational learning paths |
| BLS salary data unavailable for an occupation | "Salary data is temporarily unavailable for this career." | Yes (background) | Display "Salary data pending" with national median as placeholder |
| Browser memory exceeded on large visualization | "Simplifying the display for better performance." | No | Switch to paginated list view instead of graph |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| user_skills_profile_id | UUID | Yes | 36 / 36 chars | UUID v4 | Validate against authenticated user |
| target_occupation_code | String | No (auto-generated) | 7 / 10 chars | `^\d{2}-\d{4}(\.\d{2})?$` | Validate against O*NET lookup |
| transferability_score | Float | Yes (output) | 0.0 / 1.0 | Decimal to 4 places | Clamp to 0-1 range |
| skills_gap_list | Array[String] | Yes (output) | 0 / 50 items | Skill name strings | Deduplicate, validate against taxonomy |
| upskill_time_weeks | Integer | Yes (output) | 0 / 520 | Positive integer | Clamp to reasonable range |
| proficiency_factor | Float | Yes (internal) | 0.0 / 1.0 | Decimal | Clamp to 0-1 range |

---

### 3. Career Path Explorer

**Priority:** P0 (Core)
**Timeline:** Month 2-3
**Description:** An interactive exploration tool where users browse recommended career paths. Each path shows salary data, job growth projections, required skills gap, estimated upskilling time, and real success stories.

**Functional Requirements:**

- Display recommended career paths ranked by overall fit score
- Each career path card shows:
  - Target job title and industry
  - Transferability score (percentage match)
  - Salary range (entry, median, senior) from BLS data
  - Job growth outlook (10-year projection) from BLS
  - Number of current openings (from job board APIs)
  - Skills gap summary (e.g., "You need 3 more skills")
  - Estimated upskilling time (weeks/months)
  - Remote work availability percentage
- Filtering: by industry, salary range, location, remote-friendly, upskill time
- Sorting: by match score, salary, growth, time to transition
- Comparison view: side-by-side comparison of up to 3 career paths
- Career detail page with full occupation description, day-in-the-life, typical employers
- "Save" career paths for later exploration
- Free tier: 3 career paths visible. Navigator/Pro: unlimited

**Data Sources:**

- O*NET: occupation descriptions, required skills, typical tasks, work context
- BLS: salary data (by region), employment projections, industry trends
- Job board APIs: current openings count, location distribution
- SkillBridge internal: success stories from users who completed transitions

**User Stories:**

- As Priya, I want to compare "Project Coordinator" vs "Customer Success Manager" vs "Office Manager" side by side so I can decide which path fits my life goals.
- As Carlos, I want to filter for careers that are remote-friendly since I live in a rural area with limited local employers.
- As a free user, I want to see my top 3 recommended careers with enough detail to decide if upgrading is worth it.

**Acceptance Criteria:**

- [ ] Explorer page loads within 2 seconds (SSR with ISR revalidation every 24 hours for career data pages)
- [ ] Career cards display all required fields: title, match %, salary range, growth outlook, openings count, skills gap, upskill time, remote %
- [ ] Filtering by any combination of industry, salary, location, remote, upskill time returns results within 500 ms (client-side after initial load)
- [ ] Comparison view supports selecting and comparing up to 3 career paths side by side
- [ ] Free tier users see exactly 3 career paths; paywall is clear and non-blocking for initial exploration
- [ ] Career detail pages have unique canonical URLs, structured data (Schema.org/Occupation), and server-rendered content for SEO
- [ ] Saved career paths persist across sessions and devices for authenticated users
- [ ] All charts and data visualizations include `aria-label` descriptions and are keyboard-navigable

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| BLS API rate limit or downtime | "Some salary data may be slightly outdated. We update regularly." | Yes (background, next revalidation) | Show cached BLS data with "Last updated: [date]" |
| Job board API rate limit | "Job opening counts are being refreshed." | Yes (queued, next 6-hour cycle) | Show "50+ openings" generic estimate from last cache |
| No careers match current filters | "No careers match these filters. Try broadening your search." | No | Suggest removing the most restrictive filter |
| Career detail page for non-existent occupation | "This career path could not be found." | No | 404 page with redirect to explorer |
| User exceeds free tier (clicks 4th career) | "Upgrade to Navigator to explore unlimited career paths." | No | Show blurred preview with upgrade CTA |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| filter_industry | String | No | 2 / 100 chars | Alphanumeric + spaces | Trim, lowercase for matching |
| filter_salary_min | Integer | No | 0 / 500000 | Positive integer (USD) | Clamp to valid range |
| filter_salary_max | Integer | No | 0 / 500000 | Must be >= filter_salary_min | Clamp to valid range |
| filter_location | String | No | 2 / 100 chars | Alphanumeric, commas, spaces | Trim, geocode validation |
| filter_remote | Boolean | No | — | `true` / `false` | Type coercion |
| filter_upskill_max_weeks | Integer | No | 1 / 520 | Positive integer | Clamp to range |
| sort_by | Enum | No | — | `match_score`, `salary`, `growth`, `transition_time` | Reject invalid |
| saved_career_ids | Array[UUID] | No | 0 / 50 items | UUID v4 per entry | Validate each UUID |

---

### 4. Personalized Learning Plan

**Priority:** P0 (Core)
**Timeline:** Month 4-5
**Description:** Once a user selects a career path, SkillBridge generates a personalized learning plan that addresses their specific skills gaps. Courses are curated from free and paid providers, sequenced logically, and estimated for time commitment.

**Functional Requirements:**

- AI-generated learning plan based on:
  - Identified skills gaps for target career
  - User's current proficiency levels
  - User's available time per week (asked during setup)
  - User's budget for courses (free only, up to $X/month, no limit)
  - User's learning preferences (video, reading, hands-on, instructor-led)
- Course recommendations from multiple providers:
  - Free: Khan Academy, freeCodeCamp, Coursera (audit mode), edX (audit), YouTube curated playlists, government training programs
  - Paid: Coursera certificates, Udemy, LinkedIn Learning, Skillshare, industry-specific bootcamps
- Logical sequencing: prerequisites before advanced topics
- Milestone markers: checkpoints that map to real career readiness
- Time estimates per course and per milestone
- Progress tracking with completion percentages
- Weekly email reminders with encouragement and next steps
- Ability to swap out courses (user preference for different provider)
- Printable/downloadable plan (PDF) for users who prefer paper tracking

**User Stories:**

- As Maria, I want a learning plan that only includes free courses since I can't afford paid ones right now.
- As James, I want my plan to tell me "complete these 4 courses over 8 weeks and you'll be ready to apply for project management roles."
- As a user with 5 hours/week available, I want my plan to be realistic about timelines, not assume I can study full-time.

**Acceptance Criteria:**

- [ ] Learning plan is generated within 20 seconds of career path selection
- [ ] Plan includes at least 3 course recommendations per skill gap, with at least 1 free option
- [ ] Courses are logically sequenced: prerequisites appear before advanced topics in the plan timeline
- [ ] Time estimates adjust dynamically based on user's declared available hours per week (1-40 hrs)
- [ ] Plan respects user budget constraint: if "free only," no paid courses appear
- [ ] Milestone markers map to concrete career readiness benchmarks (e.g., "Ready to apply for entry-level roles")
- [ ] PDF export of the learning plan renders correctly with all sections, course links, and timelines
- [ ] Weekly email reminders are sent via SendGrid and include the next action item; unsubscribe works in one click
- [ ] Plan page is accessible (screen reader compatible, proper heading hierarchy, link labels)

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| Course provider API unavailable (Coursera, Udemy) | "Some course options are temporarily unavailable. Showing available alternatives." | Yes (background retry) | Show courses from available providers; backfill on recovery |
| AI plan generation timeout (> 30 s) | "Your plan is taking longer to generate. We'll email you when it's ready." | Yes (queued async) | Send plan via email; show placeholder with ETA |
| No courses found for a specific skill gap | "We couldn't find courses for [skill]. We've flagged this for manual curation." | No | Suggest related skills with available courses + YouTube search link |
| User changes career path mid-plan | "Your learning plan will be updated for your new career path." | No | Archive old plan; generate new plan (keep completed courses) |
| SendGrid email delivery failure | (Internal alert) | Yes (retry 3x) | Fall back to in-app notification |
| PDF export rendering fails | "PDF generation failed. Please try again." | Yes (1 retry) | Offer printable HTML view as alternative |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| target_career_path_id | UUID | Yes | 36 / 36 chars | UUID v4 | Validate against user's saved/accessible careers |
| available_hours_per_week | Integer | Yes | 1 / 40 | Positive integer | Clamp to range |
| budget_type | Enum | Yes | — | `free_only`, `up_to_amount`, `no_limit` | Reject invalid |
| budget_amount_usd | Float | Conditional (if `up_to_amount`) | 0 / 10000 | Positive decimal | Clamp to range, round to 2 decimal places |
| learning_preference | Enum | Yes | — | `video`, `reading`, `hands_on`, `instructor_led` | Reject invalid |
| course_id | String | Yes (per entry) | 1 / 255 chars | Alphanumeric + hyphens | Trim, validate against provider catalog |
| milestone_name | String | Yes (per milestone) | 2 / 200 chars | Free text | HTML entity encoding, trim |
| completion_status | Enum | Yes | — | `not_started`, `in_progress`, `completed` | Reject invalid |

---

### 5. AI Resume Rewriter

**Priority:** P1 (High)
**Timeline:** Month 5-6
**Description:** The AI takes the user's original resume and rewrites it to position their experience for their target career. This is not a generic rewrite -- it specifically translates industry-specific experience into the language of the target industry.

**Functional Requirements:**

- Input: original resume content (from assessment) + selected target career path
- AI rewrites each experience bullet point using target industry terminology
- Preserves factual accuracy -- never fabricates experience
- Adds a professional summary tailored to career changer narrative
- Highlights transferable skills prominently
- Suggests skills section additions based on completed courses
- Multiple resume versions: one per target career path
- Real-time preview with before/after comparison
- Export to PDF with professional formatting (3 template options)
- ATS-friendly output (applicant tracking system compatible)
- Cover letter generation option
- Version history: track all edits and revisions

**Example Transformation:**

```
BEFORE (Factory Worker):
"Operated CNC machinery to produce automotive parts within +/- 0.001" tolerance"

AFTER (Data Quality Analyst):
"Applied precision quality control methodologies to ensure output accuracy
within strict tolerance parameters, demonstrating strong attention to detail
and systematic analytical skills applicable to data validation"
```

**User Stories:**

- As Maria, I want my resume to show employers that my quality control experience on the factory floor is directly relevant to data quality work.
- As Carlos, I want a resume version for logistics coordinator and a different one for fleet management so I can apply to both.
- As Priya, I want to see the before and after side by side so I can learn how to talk about my experience differently.

**Edge Cases:**

- Resume with employment gaps: AI suggests honest, positive framing
- Career changer with no formal education: emphasize experience and certifications
- User disagrees with AI rewrite: easy editing, undo, regenerate options
- Very short work history (less than 2 years): focus on skills over chronology

**Acceptance Criteria:**

- [ ] AI rewrite of a resume completes within 25 seconds (p95) and preserves 100% factual accuracy (no fabricated experience)
- [ ] Before/after comparison view renders both versions side by side with highlighted changes
- [ ] Each experience bullet point is rewritten using target industry terminology while maintaining original meaning
- [ ] Professional summary is tailored to career changer narrative and references transferable skills
- [ ] PDF export produces ATS-friendly output (parseable by Workday, Greenhouse, Lever) in 3 template options
- [ ] Users can maintain multiple resume versions (1 per target career path) with independent edit histories
- [ ] Cover letter generation completes within 15 seconds and references the specific target role
- [ ] Undo/redo works for all AI suggestions; version history preserves last 20 versions
- [ ] Resume preview page meets WCAG 2.1 AA; PDF output includes proper document structure tags

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| OpenAI API timeout during rewrite | "Resume rewriting is taking longer than expected. Retrying..." | Yes (1 auto-retry) | Queue for background processing; notify via email when complete |
| AI generates hallucinated experience | (Pre-flight check) "AI flagged: this bullet may not match your original experience. Please review." | No | Highlight questionable bullets for manual review before saving |
| PDF rendering failure | "PDF generation encountered an issue. Please try again." | Yes (1 retry) | Offer HTML preview with browser Print-to-PDF option |
| No original resume content available | "No resume content found. Please complete a skills assessment first." | No | Redirect to assessment with context message |
| Version history storage limit reached | "Oldest version archived. Recent 20 versions preserved." | No | Auto-archive oldest version |
| Cover letter generation fails | "Cover letter generation failed. Please try again." | Yes (1 retry) | Provide cover letter template for manual editing |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| original_resume_content | Text | Yes | 50 / 50000 chars | Free text | HTML strip, normalize whitespace |
| target_career_path_id | UUID | Yes | 36 / 36 chars | UUID v4 | Validate against user's selected careers |
| rewritten_bullet | String | Yes (per bullet) | 10 / 500 chars | Free text | HTML entity encoding, preserve special chars for industry terms |
| professional_summary | String | Yes | 50 / 1000 chars | Free text | HTML entity encoding, trim |
| template_id | Enum | Yes | — | `classic`, `modern`, `minimal` | Reject invalid |
| resume_version_name | String | No | 1 / 100 chars | Alphanumeric + spaces + hyphens | Trim, HTML encode |
| cover_letter_content | Text | No | 100 / 5000 chars | Free text | HTML entity encoding |
| export_format | Enum | Yes | — | `pdf`, `docx` | Reject invalid |

---

### 6. Job Matching

**Priority:** P1 (High)
**Timeline:** Month 5-6
**Description:** A job board filtered specifically for career changers. Every listing includes a transferability score showing how well the user's skills match, and listings are sourced from employers who are open to non-traditional candidates.

**Functional Requirements:**

- Job listings aggregated from Indeed, ZipRecruiter, and direct employer partnerships
- Each listing shows:
  - Job title, company, location, salary range
  - Transferability score (how well user's current skills match)
  - Skills match breakdown (which of their skills apply, which are missing)
  - "Career changer friendly" badge for partner employers
  - Application link or in-platform application
- Filtering: by transferability score, location, salary, remote, industry, career-changer-friendly
- Sorting: by match score, salary, recency, company rating
- Daily job alerts via email (configurable frequency)
- Saved jobs list
- Application tracking (applied, interviewing, offered, rejected)
- Free tier: basic matching (top 10 jobs/day). Navigator/Pro: full access

**Matching Algorithm:**

```
job_match_score = (
  skills_overlap_score * 0.40 +
  experience_relevance_score * 0.25 +
  location_fit_score * 0.15 +
  salary_alignment_score * 0.10 +
  career_changer_friendly_score * 0.10
)
```

**User Stories:**

- As James, I want to see jobs where my retail management skills are an 80%+ match so I don't waste time applying to jobs I'm not qualified for.
- As Maria, I want to filter for jobs within 30 miles of my home since I don't have a car.
- As a user, I want to track which jobs I've applied to and their status all in one place.

**Acceptance Criteria:**

- [ ] Job listings are aggregated from at least 2 job board APIs (Indeed, ZipRecruiter) and refreshed every 6 hours
- [ ] Each listing displays a transferability score with a skills match breakdown (matched vs. missing)
- [ ] Filtering and sorting by transferability score, location, salary, remote, industry, and career-changer-friendly returns results within 1 second
- [ ] Daily job alert emails are delivered by 8 AM in the user's timezone with configurable frequency
- [ ] Application tracking supports statuses: saved, applied, interviewing, offered, rejected with date stamps
- [ ] Free tier displays top 10 jobs per day; paywall is clearly communicated with upgrade CTA
- [ ] Job detail pages are SSR with structured data (Schema.org/JobPosting) for SEO
- [ ] "Career changer friendly" badge is visually distinct and filterable

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| Job board API rate limit exceeded | "Job listings are being refreshed. Showing recent results." | Yes (queued for next cycle) | Display cached listings with "Last updated: [time]" |
| Job board API returns empty results | "No new jobs found matching your criteria. We check every 6 hours." | Yes (next cycle) | Show broader matches or recently expired listings marked as "May be filled" |
| Job detail page link is dead (employer removed listing) | "This listing may no longer be available." | No | Show cached job details with warning banner; suggest similar listings |
| Email alert delivery failure | (Internal alert) | Yes (retry 3x over 1 hour) | Fall back to in-app notification |
| Skills match calculation fails | "Match score temporarily unavailable." | Yes (background) | Show listing without score; calculate on next page load |
| Duplicate job listings from multiple APIs | (Internal dedup) | No | Merge duplicates by title + company + location hash; show single listing |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| filter_transferability_min | Integer | No | 0 / 100 | Positive integer (percentage) | Clamp to range |
| filter_location | String | No | 2 / 100 chars | Alphanumeric, commas, spaces | Trim, geocode validation |
| filter_salary_min | Integer | No | 0 / 500000 | Positive integer (USD) | Clamp to range |
| filter_remote | Boolean | No | — | `true` / `false` | Type coercion |
| filter_career_changer_friendly | Boolean | No | — | `true` / `false` | Type coercion |
| application_status | Enum | Yes (per tracked job) | — | `saved`, `applied`, `interviewing`, `offered`, `rejected` | Reject invalid |
| application_date | Date | No | — | ISO 8601 | Validate date is not in the future |
| alert_frequency | Enum | Yes | — | `daily`, `weekly`, `none` | Reject invalid |
| alert_email | Email | Yes | 5 / 254 chars | RFC 5322 | Lowercase, trim, validate MX record |

---

### MVP Feature Dependency Graph

```
Skills Assessment (P0, Month 1-2)
  |
  v
Transferable Skills Mapper (P0, Month 2-3)
  |
  +-------------------------------+
  |                               |
  v                               v
Career Path Explorer           AI Resume Rewriter
(P0, Month 2-3)               (P1, Month 5-6)
  |                               |
  v                               v
Personalized Learning Plan     Job Matching
(P0, Month 4-5)               (P1, Month 5-6)
  |                               |
  +-------------------------------+
  |
  v
[Post-MVP: Mentor Matching, Interview Prep, Employer Partnerships]

Legend:
  - Skills Assessment is the foundational dependency; all features require a completed skill profile
  - Career Path Explorer and Resume Rewriter both depend on the Mapper output
  - Learning Plan requires a selected career path from the Explorer
  - Job Matching uses both the skill profile (from Mapper) and optionally the rewritten resume
  - Solid arrows = hard dependency (feature cannot function without upstream)
```

---

## Post-MVP Features (Months 7-12)

### 7. Mentor Matching

**Priority:** P1 (High)
**Timeline:** Month 7-8
**Description:** Connect users with mentors who have successfully made similar career transitions. A factory worker transitioning to data analysis gets matched with someone who made that same transition 2 years ago.

**Functional Requirements:**

- Mentor profiles with transition story, current role, availability, areas of expertise
- Matching based on: similar origin career, same target career, geographic proximity (optional), language
- In-platform messaging (text-based, real-time via Supabase Realtime)
- Video call scheduling integration (Calendly or Cal.com embed)
- Mentor rating and review system
- Mentor onboarding: verify transition story, background check, training on mentorship best practices
- Mentor incentives: free Pro subscription, recognition badges, small stipend (from employer partnership revenue)
- Session limits: 2 sessions/month for Navigator, unlimited for Pro
- Mentor availability calendar

**User Stories:**

- As Maria, I want to talk to someone who actually went from factory work to a tech job so I know it's really possible.
- As a mentor, I want to help others make the transition I made because I remember how scared and alone I felt.

---

### 8. Employer Partnerships

**Priority:** P1 (High)
**Timeline:** Month 8-9
**Description:** Companies that actively want to hire career changers can create employer accounts, post jobs that reach our targeted audience, and access a pool of motivated, upskilling candidates.

**Functional Requirements:**

- Employer dashboard: company profile, active job listings, candidate pipeline
- "Career Changer Friendly" certification badge (criteria: structured onboarding, mentorship, skills-based hiring)
- Anonymized candidate browsing: employers see skills profiles, not names, until mutual interest
- Candidate shortlists with transferability scores
- Job posting tools with skills requirement builder (auto-mapped to O*NET)
- Analytics: views, applications, interviews, hires, time-to-hire
- Employer branding: company page visible to candidates with culture, benefits, transition support info
- Pricing: $500/month base, additional for premium placement and talent pool access

**User Stories:**

- As a hiring manager, I want to find candidates whose transferable skills match my open data entry roles, even if they've never held that title before.
- As an employer, I want the "Career Changer Friendly" badge on my listings so motivated candidates apply.

---

### 9. Progress Tracking Dashboard

**Priority:** P2 (Medium)
**Timeline:** Month 9-10
**Description:** A visual timeline of the user's entire career transition journey with milestones, achievements, and encouragement.

**Functional Requirements:**

- Timeline view: assessment completed, career path selected, courses started/completed, resume updated, jobs applied, interviews, offers
- Progress percentage toward "career ready" status
- Streak tracking: consecutive days/weeks of activity
- Achievement badges: "First Course Completed," "Resume Rewritten," "10 Applications Sent," "Interview Scheduled"
- Weekly progress summary email
- Comparison to average transition timeline (anonymized aggregate data)
- Mood/confidence check-ins (optional): track emotional journey alongside practical progress
- Exportable progress report (for sharing with workforce agencies, counselors, or family)

**User Stories:**

- As Maria, I want to see how far I've come when I feel discouraged so I remember I'm making real progress.
- As a workforce agency counselor, I want to see my client's progress report to document outcomes for our WIOA grant reporting.

---

### 10. Community Forums

**Priority:** P2 (Medium)
**Timeline:** Month 9-10
**Description:** Discussion forums organized by career transition type where users can share experiences, ask questions, and support each other.

**Functional Requirements:**

- Forum categories by transition type (e.g., "Manufacturing to Tech," "Retail to Healthcare," "Admin to Project Management")
- General categories: "Learning Tips," "Interview Experiences," "Success Stories," "Motivation"
- Threaded discussions with upvoting
- User profiles with transition journey summary (opt-in)
- Moderation tools: report, flag, auto-moderation for spam/harassment
- Expert AMAs (Ask Me Anything) with industry professionals and successful transitioners
- Pinned resource threads per category
- Search within forums

---

### 11. Interview Prep

**Priority:** P2 (Medium)
**Timeline:** Month 10-11
**Description:** AI-powered mock interviews tailored to the user's target career and specific job applications.

**Functional Requirements:**

- AI mock interviewer with streaming text responses (conversational UI)
- Questions tailored to: target career, specific job posting, user's background as a career changer
- Common career changer questions: "Why are you changing careers?" "What makes you qualified?"
- Industry-specific behavioral and technical questions
- Real-time feedback on answer quality, structure (STAR method coaching), and content
- Session recording (text transcript) for review
- Suggested answer improvements with examples
- Practice mode (unlimited) and evaluation mode (scored)
- Pro tier only

**User Stories:**

- As James, I want to practice answering "Why are you leaving retail?" in a way that sounds positive and confident rather than desperate.
- As Priya, I want mock interview questions specifically for the Customer Success Manager role I'm applying to at Salesforce.

---

### 12. Salary Negotiation Coach

**Priority:** P3 (Low)
**Timeline:** Month 11-12
**Description:** AI-powered guidance for negotiating salary as a career changer, including market data, scripts, and strategy.

**Functional Requirements:**

- Salary benchmarking: market rate for target role by location, experience level, and industry
- Negotiation scripts customized for career changers (how to justify your ask when changing fields)
- Counter-offer strategy guides
- Total compensation analysis (salary, benefits, equity, growth potential)
- Practice negotiation with AI (simulated back-and-forth)
- "What to expect" guides for salary at different career stages post-transition

---

## Year 2+ Features (Months 13+)

### 13. Government Workforce Development Partnerships

**Priority:** P1 (High -- revenue driver)
**Timeline:** Month 13-15
**Description:** Custom SkillBridge deployments for state workforce development agencies, funded through WIOA (Workforce Innovation and Opportunity Act) and TAA (Trade Adjustment Assistance) programs.

**Functional Requirements:**

- White-label deployment option (state agency branding)
- Bulk user provisioning (agency enrolls participants)
- Custom reporting for WIOA compliance (participant outcomes, employment rates, wage gains)
- Integration with state workforce systems (varies by state)
- Case manager dashboard: view and manage participant progress
- Co-enrollment tracking (users in multiple programs)
- Data security compliance (FedRAMP path for federal contracts)

---

### 14. Employer-Sponsored Plans

**Priority:** P2 (Medium)
**Timeline:** Month 15-18
**Description:** Companies can sponsor SkillBridge access for their own employees who are being displaced by automation, as part of responsible restructuring.

**Functional Requirements:**

- Employer admin dashboard for bulk license management
- Custom career paths aligned with employer's industry partnerships (e.g., auto manufacturer partners with tech companies for worker transitions)
- Outplacement integration: works alongside traditional outplacement services
- Outcome reporting for employer CSR/ESG metrics
- Pricing: per-seat enterprise licensing

---

### 15. Credential Verification (Blockchain)

**Priority:** P3 (Low)
**Timeline:** Month 18-24
**Description:** Verified, tamper-proof records of completed courses, earned credentials, and demonstrated skills.

**Functional Requirements:**

- Blockchain-based credential issuance for completed learning milestones
- Verifiable by employers via unique credential URL
- Integration with Open Badges 3.0 standard
- Skills portfolio: shareable page with verified skills and credentials
- Partnership with course providers for direct credential issuance

---

### 16. AR/VR Skills Training

**Priority:** P3 (Low -- experimental)
**Timeline:** Month 20-24
**Description:** Immersive training experiences for skills that are hard to learn from video or text alone.

**Functional Requirements:**

- WebXR-based training modules (browser-native, no headset required initially)
- Focus on hands-on skills: equipment operation, customer interaction simulation, safety procedures
- Partnership with VR training content providers
- Progress tracking integrated with learning dashboard

---

### 17. International Market Expansion

**Priority:** P2 (Medium)
**Timeline:** Month 18-24
**Description:** Expand beyond the US market to countries with high automation displacement.

**Functional Requirements:**

- Multi-language support (Spanish first, then German, French, Mandarin, Hindi)
- Country-specific labor market data and occupation databases
- Local job board API integrations
- Currency localization for pricing
- Compliance with local data privacy regulations (GDPR, etc.)
- Priority markets: Canada, UK, Germany, India, Mexico

---

### 18. API for Workforce Development Agencies

**Priority:** P2 (Medium)
**Timeline:** Month 15-18
**Description:** Public API allowing workforce development agencies, community colleges, and nonprofits to integrate SkillBridge capabilities into their own platforms.

**Functional Requirements:**

- RESTful API with OAuth 2.0 authentication
- Endpoints: skills assessment, career path recommendation, job matching
- Rate limiting and usage-based pricing
- API documentation with interactive playground
- SDK libraries (JavaScript, Python)
- Webhook support for real-time event notifications

---

## Development Timeline (Detailed)

### Month 1
- Project setup (Next.js 14, Supabase, CI/CD pipeline)
- Design system foundation (Tailwind config, base components)
- Landing page and marketing site
- User authentication (email/password, Google OAuth, magic link)
- Database schema v1 (users, skills, profiles)

### Month 2
- Resume upload and PDF parsing
- Skills assessment questionnaire (guided flow)
- OpenAI integration for skills extraction
- O*NET API integration for skills taxonomy mapping
- Skills profile display page

### Month 3
- Transferable skills mapping algorithm
- Career path explorer (browse, filter, sort)
- BLS API integration (salary data, growth projections)
- Career path detail pages
- Career comparison view
- Free tier paywall (3 career paths limit)

### Month 4
- Learning plan generation engine
- Course provider API integrations (Coursera, Udemy catalogs)
- Learning dashboard with progress tracking
- Course recommendation algorithm
- Weekly email reminders (SendGrid)

### Month 5
- AI resume rewriter
- Resume preview and PDF export
- Cover letter generator
- Stripe integration for subscriptions
- Navigator tier launch

### Month 6
- Job matching engine
- Job board API integrations (Indeed, ZipRecruiter)
- Job listing display with transferability scores
- Application tracking
- Daily job alerts
- MVP launch (public beta)

### Month 7-8
- Mentor matching system
- In-platform messaging
- Mentor onboarding and vetting process
- Employer partnership portal (basic)
- Pro tier launch

### Month 9-10
- Progress tracking dashboard
- Achievement badges system
- Community forums
- Employer dashboard and job posting tools
- "Career Changer Friendly" certification program

### Month 11-12
- Interview prep (AI mock interviews)
- Salary negotiation coach
- Advanced analytics and reporting
- Performance optimization and scaling
- Government partnership pilot (1-2 state agencies)

---

## Edge Cases and Special Considerations

### User Experience Edge Cases

| Scenario | Handling |
| -------- | -------- |
| User has zero transferable skills for any growing career | Extremely rare but possible. Show foundational learning paths, emphasize that every career starts somewhere. Never tell a user they have "no skills." |
| User selects a career path and then gets discouraged | Progress encouragement notifications, mentor matching prompt, success stories of similar transitions |
| User completes all learning but can't find a job | Expand job search radius, suggest adjacent roles, offer interview prep, connect with employer partners |
| User is over 60 and feels age discrimination | Tailor advice for age-inclusive employers, emphasize experience as an asset, connect with mentors in same age range |
| User has a disability that limits career options | Accessibility-first design, filter for disability-accommodating employers, connect with vocational rehabilitation agencies |
| User speaks limited English | Currently English-only with clear roadmap for Spanish and other languages. Provide translated UI elements where possible |
| User has criminal record | Include "fair chance" employers who don't use background checks for initial screening. Never ask about criminal history in assessment |
| User is in immediate financial distress | Priority: free resources, fastest-path career recommendations, emergency workforce program connections |

### Technical Edge Cases

| Scenario | Handling |
| -------- | -------- |
| OpenAI API downtime | Graceful degradation: show cached recommendations, queue assessment for processing when API returns |
| Job board API rate limits exceeded | Implement job listing cache (refresh every 6 hours), queue requests during peak |
| User uploads malicious PDF | Sandboxed PDF parsing in Edge Function, file type validation, size limits, virus scanning |
| Concurrent resume edits across devices | Last-write-wins with conflict notification, version history for recovery |
| Supabase downtime | Static pages remain accessible, dashboard shows maintenance message, no data loss (write queue) |

---

*Features designed around one question: "What's the fastest, clearest, most encouraging path from where you are to where you want to be?"*
