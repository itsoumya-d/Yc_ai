# SkillBridge -- Screens

## Navigation Architecture

### Information Architecture

```
Public (Unauthenticated)
+-- Landing Page (/)
+-- How It Works (/how-it-works)
+-- Success Stories (/stories)
+-- Career Database (/careers) [SEO content]
+-- Blog (/blog) [SEO content]
+-- Pricing (/pricing)
+-- Login (/login)
+-- Signup (/signup)
+-- About (/about)

Authenticated (Dashboard)
+-- Assessment (/dashboard/assessment)
|   +-- Step 1: Choose Path (resume or questionnaire)
|   +-- Step 2: Resume Upload or Questionnaire
|   +-- Step 3: Skills Review
|   +-- Step 4: Complete
+-- Skills Profile (/dashboard/skills)
+-- Career Explorer (/dashboard/careers)
|   +-- Career Detail (/dashboard/careers/[slug])
|   +-- Career Comparison (/dashboard/careers/compare)
+-- Learning Dashboard (/dashboard/learning)
|   +-- Course Detail (/dashboard/learning/[courseId])
+-- Job Board (/dashboard/jobs)
|   +-- Job Detail (/dashboard/jobs/[jobId])
|   +-- Application Tracker (/dashboard/jobs/applications)
+-- Resume Builder (/dashboard/resume)
|   +-- Resume Preview (/dashboard/resume/preview)
+-- Community (/dashboard/community)
|   +-- Forums (/dashboard/community/forums)
|   +-- Mentor Directory (/dashboard/community/mentors)
|   +-- Mentor Chat (/dashboard/community/mentors/[mentorId])
+-- Progress Tracker (/dashboard/progress)
+-- Profile & Settings (/dashboard/settings)
|   +-- Account (/dashboard/settings/account)
|   +-- Subscription (/dashboard/settings/subscription)
|   +-- Notifications (/dashboard/settings/notifications)
|   +-- Privacy (/dashboard/settings/privacy)
```

### Global Navigation

**Top Navigation Bar (Public Pages):**
- Logo (links to /)
- How It Works
- Success Stories
- Careers (SEO database)
- Pricing
- Login (button, outlined)
- Get Started Free (button, filled, primary CTA)

**Dashboard Sidebar Navigation (Authenticated):**
- Logo (links to dashboard home)
- Assessment (icon: clipboard-check)
- My Skills (icon: puzzle-piece)
- Careers (icon: map)
- Learning (icon: academic-cap)
- Jobs (icon: briefcase)
- Resume (icon: document-text)
- Community (icon: user-group) [Post-MVP]
- Progress (icon: chart-bar) [Post-MVP]
- Divider
- Settings (icon: cog)
- Help (icon: question-mark-circle)
- Subscription badge (Free / Navigator / Pro)

**Mobile Navigation:**
- Bottom tab bar with 5 key items: Skills, Careers, Learning, Jobs, More
- "More" expands to: Resume, Community, Progress, Settings
- Hamburger menu for secondary navigation
- Sticky bottom CTA on assessment pages

---

## Screen Specifications

### Screen 1: Landing Page

**Route:** `/`
**Purpose:** Convert visitors into users who start the free assessment.
**Layout:** Full-width marketing page, no sidebar.

**Sections (top to bottom):**

1. **Hero Section**
   - Headline: "Your skills are worth more than you think."
   - Subheadline: "SkillBridge uses AI to discover your transferable skills, map them to growing careers, and guide your transition step by step."
   - Primary CTA: "Start Your Free Assessment" (large button, warm teal)
   - Secondary CTA: "See How It Works" (text link)
   - Hero image: warm illustration of diverse workers on a bridge metaphor (abstract, not cheesy)
   - Trust badges: "85M workers affected by automation" stat, "Join 10,000+ career changers"

2. **How It Works (3-Step)**
   - Step 1: "Tell us about your experience" (upload resume or answer questions icon)
   - Step 2: "Discover your career matches" (career path explorer preview)
   - Step 3: "Start your transformation" (learning plan and job matching preview)
   - Each step has a brief description and subtle animation on scroll

3. **Value Propositions (Grid)**
   - "AI Skills Analysis" -- We find skills you didn't know you had
   - "Personalized Career Paths" -- Not generic advice, paths matched to YOUR skills
   - "Free Learning Plans" -- Curated courses from free and paid sources
   - "Smart Job Matching" -- Jobs scored by how well your skills transfer
   - "AI Resume Rewriter" -- Your experience, reframed for your new career
   - "Mentor Support" -- Learn from people who've made the same transition

4. **Success Stories Carousel**
   - 3-4 cards showing real (or representative) transition stories
   - Photo, name, "From [old career] to [new career]"
   - Brief quote and transition timeline
   - "Read full story" link

5. **Statistics Bar**
   - "85M jobs at risk" | "Average 72% skills match" | "4-month avg transition" | "92% satisfaction"
   - Dark background, light text, warm teal accents

6. **Career Categories Preview**
   - Grid of popular transition categories with icons
   - "Manufacturing to Tech" | "Retail to Healthcare" | "Admin to Project Management" | etc.
   - Each links to SEO-optimized career content page

7. **Pricing Preview**
   - 3-tier cards (Free, Navigator, Pro) with key features
   - "Start Free" CTA on each

8. **FAQ Accordion**
   - "Is SkillBridge really free?" | "How does the AI work?" | "How long does a career transition take?" | "I'm not tech-savvy, can I use this?"
   - Structured data markup for Google featured snippets

9. **Final CTA Section**
   - "Ready to discover what you're capable of?"
   - "Start Your Free Assessment" button
   - "No credit card required. Takes 10 minutes."

10. **Footer**
    - Company links, legal, social media, contact, blog, careers database

**States:**
- Default (new visitor)
- Returning visitor (show "Welcome back" and "Continue your assessment" if applicable)
- Mobile: hero stacks vertically, single-column layout, bottom sticky CTA

**Accessibility:**
- All images have descriptive alt text
- Heading hierarchy: single H1, H2 for sections, H3 for subsections
- Color contrast ratio minimum 4.5:1 for all text
- All interactive elements keyboard focusable
- Skip-to-content link as first focusable element
- Reduced motion: disable scroll animations when prefers-reduced-motion is set

---

### Screen 2: Onboarding / Assessment

**Route:** `/dashboard/assessment`
**Purpose:** Collect user information to build their skills profile.
**Layout:** Centered content, step indicator at top, minimal distractions.

**Step 1: Choose Your Path**
- Headline: "Let's get to know your experience"
- Two large cards:
  - "Upload Your Resume" -- icon: document upload, description: "We'll analyze your resume and identify your transferable skills in under 2 minutes"
  - "Answer a Few Questions" -- icon: chat bubbles, description: "No resume? No problem. We'll guide you through a short questionnaire about your work experience"
- Note below: "You can always edit your skills profile later"

**Step 2a: Resume Upload**
- Drag-and-drop zone with clear file format indicators (PDF, DOCX)
- "Choose File" button as alternative
- File size limit: 10MB
- Upload progress indicator
- Processing state: "Analyzing your resume..." with animated progress
- Error state: "We couldn't read your file. Try a different format or answer our questionnaire instead."

**Step 2b: Guided Questionnaire**
- One question per screen (not overwhelming)
- Progress bar at top showing question X of Y
- Question types:
  - "What industry do you work in (or most recently worked in)?" -- searchable dropdown
  - "What is/was your job title?" -- free text with autocomplete from O*NET
  - "How many years of experience do you have?" -- slider (0-40+)
  - "Describe your typical daily tasks" -- textarea with examples
  - "What tools or equipment do you use regularly?" -- multi-select with common options + free text
  - "Do you have any certifications or licenses?" -- multi-select + free text
  - "What are you best at in your current/last job?" -- checkbox grid (attention to detail, teamwork, problem-solving, etc.)
  - "What do you enjoy most about your work?" -- checkbox grid
  - "What's your education level?" -- select
  - "Are you currently employed?" -- yes/no (affects urgency of recommendations)
  - "How much time can you dedicate to learning per week?" -- slider (1-40 hours)
  - "What's your budget for courses?" -- select (free only, up to $50/mo, up to $100/mo, flexible)
  - "What's most important to you in your next career?" -- rank: salary, growth, work-life balance, remote, purpose
- Back button on every screen
- Save progress at every step

**Step 3: Skills Review**
- Headline: "Here's what we found"
- Skills displayed as badges organized by category (Technical, Interpersonal, Analytical, etc.)
- Each skill badge shows: skill name, proficiency level (visual indicator), source (resume or questionnaire)
- User can:
  - Remove a skill (click X)
  - Edit proficiency level (click to cycle through levels)
  - Add a skill (search/type, uses O*NET autocomplete)
  - Rearrange by drag-and-drop (optional)
- "We found X transferable skills!" -- encouraging message
- "Continue to Career Explorer" CTA

**Step 4: Complete**
- Celebration screen with confetti animation (subtle, respectful)
- "Your skills profile is ready!"
- Summary: "We identified X skills across Y categories"
- "Explore Your Career Matches" primary CTA
- "Edit Your Profile" secondary link

**States:**
- Empty state: first-time user, no data
- In-progress: returning user who left mid-assessment (restore from saved state)
- Complete: assessment finished, redirect to skills profile
- Error: AI processing failed (show retry option and questionnaire fallback)
- Loading: AI analyzing resume (skeleton loading with progress messages)

**Accessibility:**
- Progress bar has aria-valuenow, aria-valuemin, aria-valuemax
- Question labels properly associated with inputs via for/id
- Error messages associated with fields via aria-describedby
- Large touch targets for all interactive elements (48px minimum)
- Auto-focus management between steps (focus moves to new content)
- Form validation errors announced via aria-live

---

### Screen 3: Skills Profile

**Route:** `/dashboard/skills`
**Purpose:** View and edit identified skills with proficiency levels and categorization.
**Layout:** Dashboard layout with sidebar. Content in main area.

**UI Elements:**

- **Header:** "Your Skills Profile" with last-updated timestamp
- **Summary Stats Bar:** Total skills count, strongest category, skills added this month
- **Skills by Category (Accordion or Tab layout):**
  - Technical Skills
  - Interpersonal / Soft Skills
  - Analytical Skills
  - Management / Leadership Skills
  - Industry-Specific Skills
  - Tools & Technology
  - Certifications & Licenses
- **Each Skill Badge:**
  - Skill name
  - Proficiency level indicator (4 dots: beginner, intermediate, advanced, expert)
  - Source indicator (resume, questionnaire, user-added, course-earned)
  - Edit button (pencil icon)
  - Remove button (X icon, with confirmation)
- **Add Skill Button:** Opens search modal with O*NET autocomplete
- **Skills Radar Chart:** Visual representation of skill balance across categories (recharts radar chart)
- **Export Button:** Download skills profile as PDF
- **"Retake Assessment" Link:** Start fresh if user wants to redo

**States:**
- Default: skills displayed in categorized grid
- Edit mode: inline editing of proficiency levels
- Empty: no skills yet (redirect to assessment)
- Loading: skills being processed after assessment

---

### Screen 4: Career Explorer

**Route:** `/dashboard/careers`
**Purpose:** Browse and explore recommended career paths ranked by fit.
**Layout:** Dashboard layout. Filter sidebar (left or top on mobile) + career cards grid.

**UI Elements:**

- **Header:** "Your Career Matches" with match count
- **Filter Panel (collapsible on mobile):**
  - Industry: multi-select checkboxes
  - Salary Range: dual slider ($30K-$150K+)
  - Growth Outlook: high growth only toggle
  - Remote Availability: slider (0-100% remote)
  - Upskill Time: slider (1 month - 2 years)
  - Location: zip code + radius
  - Career Changer Friendly: toggle
  - Clear all filters button
- **Sort Dropdown:** Best Match, Highest Salary, Fastest Transition, Highest Growth
- **Career Path Cards (Grid, 2-3 columns desktop, 1 column mobile):**
  - Target job title (large, bold)
  - Industry badge
  - Transferability Score: circular progress indicator with percentage (e.g., "78% match")
  - Salary range: "Entry $45K -- Senior $85K"
  - Growth outlook: arrow icon with percentage ("12% growth over 10 years")
  - Current openings count
  - Skills gap summary: "You need 3 more skills"
  - Estimated transition time: "Est. 3-4 months"
  - Remote availability badge if applicable
  - "Explore" button (primary)
  - "Save" button (bookmark icon)
  - Lock icon for paths beyond free tier limit (with upgrade prompt)
- **Compare Button (floating):** "Compare X paths" (appears when 2+ paths are saved)
- **Pagination or Infinite Scroll**

**Career Detail Page (`/dashboard/careers/[slug]`):**
- Breadcrumb: Careers > [Career Title]
- Large header with career title, industry, transferability score
- Tabs:
  - Overview: description, typical day, work environment, advancement opportunities
  - Skills Match: side-by-side comparison of user's skills vs required skills, with gap highlights
  - Salary Data: chart by region, experience level, industry (recharts bar chart)
  - Growth Outlook: 10-year projection chart, industry trends
  - Learning Path Preview: courses needed to close skills gap
  - Job Openings: current listings for this career
  - Success Stories: users who made this transition
- "Start This Path" CTA: creates career path and generates learning plan
- "Save for Later" secondary action
- "Compare with..." action to add to comparison

**Career Comparison Page (`/dashboard/careers/compare`):**
- Side-by-side (2-3 columns) comparison table
- Rows: transferability score, salary range, growth, openings, skills gap, upskill time, remote %
- Visual indicators (green/amber/red) for easy scanning
- "Choose This Path" button on each column

**States:**
- Default: career cards loaded and filtered
- Empty results: no careers match current filters (suggest broadening)
- Free tier limit: first 3 paths visible, remaining blurred with upgrade prompt
- Loading: skeleton cards while AI generates recommendations
- Error: failed to load (retry button)

**Accessibility:**
- Filter controls properly labeled with fieldset/legend
- Career cards are focusable, navigable by keyboard
- Score percentages have screen reader text (e.g., "78 percent skills match")
- Color coding supplemented with text/icons (not color alone)
- Comparison table has proper header associations

---

### Screen 5: Learning Dashboard

**Route:** `/dashboard/learning`
**Purpose:** View and track progress through personalized learning plans.
**Layout:** Dashboard layout with sidebar. Main content area with course list.

**UI Elements:**

- **Header:** "Your Learning Plan" with career path name
- **Progress Summary Bar:**
  - Overall completion percentage (large circular progress)
  - Current milestone name
  - Estimated time remaining
  - Weekly commitment target vs actual
- **Milestone Timeline (Horizontal on desktop, vertical on mobile):**
  - Visual timeline with milestone markers
  - Each milestone: name, skills it covers, completion status
  - Current milestone highlighted
  - Future milestones grayed but visible
- **Course List (within current milestone):**
  - Course card:
    - Course title
    - Provider (Coursera, Udemy, Khan Academy, etc.) with logo
    - Duration estimate
    - Cost (Free or $X)
    - Skill(s) it covers
    - Progress bar (if started)
    - "Start" or "Continue" button
    - "Swap" button (find alternative course)
    - Completion checkbox
  - Completed courses: green checkmark, strike-through styling
  - Locked courses: shown grayed, "Complete prerequisite first" note
- **Weekly Schedule Suggestion:**
  - Based on user's available hours
  - "This week: focus on [course name], aim for 3 hours"
- **Add Course Button:** Search and add courses outside the plan
- **Recalculate Plan Button:** Regenerate plan based on updated progress
- **Print/Download Plan Button:** PDF export

**Course Detail Page (`/dashboard/learning/[courseId]`):**
- Course title, provider, instructor, rating
- Direct link to course on provider's platform (opens in new tab)
- Skills covered by this course
- Estimated time to complete
- User's notes section (free text)
- Mark as complete button
- "Find Similar" button for alternatives

**States:**
- Default: active learning plan with courses
- No plan yet: prompt to select a career path first
- All courses complete: celebration, prompt to update resume and start job search
- Plan needs refresh: user's skills have changed, suggest recalculation

---

### Screen 6: Job Board

**Route:** `/dashboard/jobs`
**Purpose:** Browse job listings matched to user's skills with transferability scores.
**Layout:** Dashboard layout. Filter panel + job listings.

**UI Elements:**

- **Header:** "Jobs For You" with match count and last-updated time
- **Filter Panel:**
  - Minimum match score: slider (50-100%)
  - Location: zip code + radius + remote toggle
  - Salary range: dual slider
  - Industry: multi-select
  - Career Changer Friendly: toggle (show only partner employers)
  - Posted within: dropdown (24h, 7 days, 30 days)
  - Full-time / Part-time / Contract: checkboxes
- **Job Listing Cards (List view, single column):**
  - Job title (bold, linked to detail)
  - Company name and logo
  - Location (or "Remote")
  - Salary range (if available)
  - Posted date
  - **Transferability Score Badge:** circular indicator with percentage
  - Skills match bar: visual breakdown of matched vs missing skills
  - "Career Changer Friendly" badge (if employer partner)
  - "Quick Apply" button (if supported)
  - "Save" button (bookmark icon)
  - "View Details" link
- **Sort:** Best Match, Newest, Highest Salary
- **Daily Digest Toggle:** "Email me new matches daily"

**Job Detail Page (`/dashboard/jobs/[jobId]`):**
- Full job description
- Company info and link
- Salary range
- Skills match breakdown:
  - "Your matching skills" (green checkmarks)
  - "Skills you're building" (amber, linked to learning plan)
  - "Skills gap" (red, with course recommendations)
- "Apply" button (links to external application or in-platform)
- "Rewrite Resume for This Job" button (generates targeted resume version)
- "Save" button
- Similar jobs section

**Application Tracker (`/dashboard/jobs/applications`):**
- Kanban board layout:
  - Saved | Applied | Interviewing | Offered | Rejected
- Each card: job title, company, date applied, current status
- Drag-and-drop to update status
- Notes field per application
- Statistics: total applied, interview rate, response rate

**States:**
- Default: matched jobs displayed
- No matches: "We're looking for jobs that match your skills. Check back soon." with tips to improve matches
- Loading: skeleton cards while matching runs
- Free tier: top 10 jobs visible, remaining behind paywall
- Job expired: grayed out with "No longer available" label

---

### Screen 7: Resume Builder

**Route:** `/dashboard/resume`
**Purpose:** AI-powered resume rewriting and export for target career.
**Layout:** Dashboard layout. Split-pane: editor (left) and preview (right).

**UI Elements:**

- **Header:** "Resume Builder" with target career name
- **Career Selector:** Dropdown to choose which career path to target
- **Split View (Desktop):**
  - Left: editable resume content (rich text editor)
  - Right: live PDF preview (react-pdf)
  - Resize handle between panes
- **Single View (Mobile):** Toggle between Edit and Preview modes
- **Sections in Editor:**
  - Professional Summary (AI-generated, editable)
  - Work Experience (AI-rewritten bullets, editable)
  - Skills (auto-populated from skills profile + completed courses)
  - Education
  - Certifications
  - Additional Sections (volunteer, projects, interests -- optional)
- **AI Actions (contextual buttons):**
  - "Rewrite for [Career]" -- regenerate all content for target career
  - "Improve This Bullet" -- rewrite individual experience bullet
  - "Add Achievement" -- suggest quantified achievement from context
  - "Optimize for ATS" -- ensure keywords match target job descriptions
- **Before/After Toggle:** Show original vs rewritten content side by side
- **Template Selector:** 3 professional templates (clean, modern, classic)
- **Download Button:** Export as PDF
- **Version History:** Dropdown showing previous versions with dates
- **Cover Letter Tab:** Generate cover letter for specific job application

**States:**
- Default: AI-rewritten resume displayed in editor
- No resume data: prompt to complete assessment first
- Generating: AI is processing (loading indicator on affected sections)
- Multiple versions: version selector dropdown
- Unsaved changes: indicator dot on save button

**Accessibility:**
- Editor supports keyboard navigation
- Preview has screen reader description of layout
- Template previews have descriptive alt text
- Export format options include accessible PDF

---

### Screen 8: Community

**Route:** `/dashboard/community`
**Purpose:** Forums and mentor connections for peer support.
**Layout:** Dashboard layout. Sub-navigation tabs: Forums, Mentors.

**Forums (`/dashboard/community/forums`):**
- **Category List:**
  - Popular transition categories with post count and activity indicator
  - "Manufacturing to Tech" | "Retail to Healthcare" | etc.
  - General: "Learning Tips" | "Interview Stories" | "Motivation" | "Success Stories"
- **Thread List (within category):**
  - Thread title, author, reply count, last activity time
  - Pinned threads at top
  - Sort by: newest, most replies, most upvotes
- **Thread View:**
  - Original post with author profile (transition summary), timestamp
  - Reply thread (nested one level)
  - Upvote/downvote buttons
  - Report button
  - Reply editor (rich text, supports formatting and images)
- **New Thread Button:** Opens compose modal

**Mentor Directory (`/dashboard/community/mentors`):**
- **Filter Panel:**
  - Transition type: from [industry] to [industry]
  - Availability: this week, this month
  - Language
  - Rating minimum
- **Mentor Cards (Grid):**
  - Profile photo
  - Name, current job title
  - Transition badge: "Factory Worker -> Data Analyst"
  - Years since transition
  - Rating (stars)
  - Availability indicator (green dot)
  - Brief bio (2 lines)
  - "Request Session" button
- **Mentor Detail Page:**
  - Full transition story
  - Skills and expertise
  - Availability calendar
  - Reviews from mentees
  - "Request 1-on-1" button
  - "Send Message" button

**Mentor Chat (`/dashboard/community/mentors/[mentorId]`):**
- Messaging interface (real-time via Supabase Realtime)
- Message history
- Text input with send button
- Video call scheduling button (Calendly embed)
- Session history with dates

**States:**
- Default: active community with content
- Empty forum: seed content from team, prompt to be first poster
- No mentors available: waitlist signup, suggest forums instead
- Pro-only features: lock icon with upgrade prompt for mentor matching

---

### Screen 9: Progress Tracker

**Route:** `/dashboard/progress`
**Purpose:** Visual timeline of the entire career transition journey.
**Layout:** Dashboard layout. Full-width timeline with milestone details.

**UI Elements:**

- **Header:** "Your Transition Journey" with start date and current status
- **Overall Progress Bar:** percentage toward "career ready" with label
- **Timeline View (Vertical, scrollable):**
  - Each event is a node on the timeline:
    - Assessment completed (date, skills count)
    - Career path selected (date, career name)
    - Learning milestones (course completed, skill earned)
    - Resume versions (created, updated)
    - Job applications (applied, interview, offer)
    - Mentor sessions (date, mentor name)
    - Custom milestones (user-added)
  - Node styling:
    - Completed: filled circle, green, with checkmark
    - Current: pulsing circle, warm teal
    - Upcoming: hollow circle, gray
  - Expandable detail for each node
- **Achievement Badges Section:**
  - Grid of earned badges with names and dates
  - Examples: "First Step" (completed assessment), "Skill Seeker" (completed 5 courses), "Brave Applier" (applied to 10 jobs), "Interview Ready" (completed mock interview), "Career Changer" (landed new job)
  - Unearned badges shown as locked (silhouette)
- **Statistics Panel:**
  - Days on journey
  - Courses completed
  - Skills acquired
  - Jobs applied to
  - Interviews landed
  - Current streak (consecutive active weeks)
- **Mood Check-In (Optional):**
  - Weekly prompt: "How are you feeling about your transition?" (emoji scale)
  - Tracked over time as a mood trend line
- **Weekly Summary Card:**
  - This week's activity summary
  - Next recommended action
  - Motivational quote or success story snippet
- **Export Button:** Download progress report (PDF)

**States:**
- Default: timeline with events populated
- New user: only assessment node, with encouragement to continue
- Milestone reached: celebration animation (confetti, badge unlock)
- Inactive: gentle nudge to re-engage

---

### Screen 10: Profile and Settings

**Route:** `/dashboard/settings`
**Purpose:** Account management, subscription, notifications, privacy.
**Layout:** Dashboard layout. Left sidebar navigation within settings, content area.

**Sub-pages:**

**Account (`/dashboard/settings/account`):**
- Profile photo upload
- Name, email, phone (editable)
- Location (city, state -- used for job matching)
- Password change
- Connected accounts (Google)
- Delete account (with confirmation modal and data export option)

**Subscription (`/dashboard/settings/subscription`):**
- Current plan display with features list
- Upgrade/downgrade buttons
- Billing history table
- Payment method management (Stripe portal)
- Cancel subscription (with retention offer)
- Plan comparison table

**Notifications (`/dashboard/settings/notifications`):**
- Email notifications toggles:
  - Daily job matches
  - Weekly progress summary
  - Course reminders
  - Mentor messages
  - Community replies
  - Product updates
- Push notification toggles (if PWA installed)
- Email frequency: daily, weekly, monthly

**Privacy (`/dashboard/settings/privacy`):**
- Profile visibility: public (mentors can find you), private (invisible)
- Resume sharing: allow employer browsing (anonymized), opt out
- Data export: download all your data (GDPR/CCPA)
- Data deletion: request full data deletion
- Analytics opt-out: disable usage tracking

---

### Screen 11: Success Stories

**Route:** `/stories` (public) and `/dashboard/community/stories` (authenticated)
**Purpose:** Showcase real career transition stories to inspire and build trust.
**Layout:** Public page (marketing layout) or dashboard. Card grid.

**UI Elements:**

- **Header:** "Real Transitions. Real People." with count
- **Filter:** By industry transition type, location, timeline
- **Story Cards (Grid):**
  - Person's photo (or avatar if anonymous)
  - Name (or first name + last initial)
  - Transition badge: "Retail Manager -> Project Manager"
  - Timeline: "Transitioned in 4 months"
  - Brief excerpt of their story (2-3 lines)
  - "Read Full Story" link
- **Full Story Page:**
  - Hero with photo, name, transition summary
  - Sections: Background, The Challenge, Discovery (how they found SkillBridge), The Journey (learning, resume, job search), The Outcome (new job, salary change), Advice for Others
  - Skills they transferred (badge display)
  - Courses they completed
  - "Start Your Story" CTA at bottom
- **Submit Your Story Form (Authenticated):**
  - Prompted after user marks a transition as complete
  - Structured questions matching the story template
  - Photo upload (optional)
  - Public/anonymous toggle
  - Review before publishing

---

## Responsive Design Strategy

### Breakpoints

| Breakpoint | Width | Layout |
| ---------- | ----- | ------ |
| **Mobile** | < 640px | Single column, bottom nav, stacked cards |
| **Tablet** | 640px - 1024px | Two columns for cards, collapsible sidebar |
| **Desktop** | 1024px - 1440px | Full sidebar, 2-3 column grids, split panes |
| **Wide** | > 1440px | Max-width container (1280px), centered content |

### Mobile-Specific Adaptations

- Bottom tab navigation replaces sidebar
- Filter panels are full-screen overlays (not inline)
- Career cards stack in single column with full width
- Resume builder toggles between edit and preview (not split)
- Tables convert to card-based layouts
- Touch-friendly slider controls (larger handles)
- Swipe gestures for career path comparison (horizontal scroll)
- Sticky CTAs at bottom of screen during assessment

---

## Accessibility Requirements (All Screens)

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
| ----------- | -------------- |
| **Color contrast** | 4.5:1 minimum for normal text, 3:1 for large text. Verified with axe-core |
| **Keyboard navigation** | All interactive elements focusable and operable via keyboard. Visible focus indicators |
| **Screen reader support** | Semantic HTML, ARIA labels, live regions for dynamic content |
| **Focus management** | Focus moves logically through page. Returns to trigger after modal close |
| **Error identification** | Form errors identified by text, not just color. Associated with inputs via aria-describedby |
| **Text sizing** | Supports 200% zoom without horizontal scrolling. 16px minimum body text |
| **Touch targets** | 44px minimum tap target size on mobile (48px preferred) |
| **Motion** | Respects prefers-reduced-motion. No auto-playing animations |
| **Language** | Page language declared in HTML. Any non-English content marked with lang attribute |
| **Time limits** | No session timeouts during assessment. Auto-save prevents data loss |
| **Alt text** | All images have descriptive alt text. Decorative images marked with aria-hidden |
| **Skip links** | "Skip to main content" link as first focusable element |
| **Headings** | Proper heading hierarchy (H1 > H2 > H3) on every page |
| **Forms** | All inputs have visible labels. Required fields marked. Error messages descriptive |

### Empathetic UX Considerations

| Principle | Application |
| --------- | ----------- |
| **Warm tone** | All system messages use encouraging, warm language. "Great progress!" not "Task completed." |
| **No blame** | Error messages never blame the user. "We couldn't read that file" not "You uploaded an invalid file." |
| **Clear next steps** | Every screen ends with a clear, single next action. No dead ends |
| **Progress visibility** | Users always know where they are in the journey and what's next |
| **Cognitive load** | One question per screen in assessment. Limited choices per screen. Progressive disclosure |
| **Patience** | Allow users to take their time. No countdown timers. Save progress automatically |
| **Safety** | Undo available for destructive actions. Confirmation for deletions. Version history for resumes |
| **Celebration** | Mark achievements with subtle, respectful celebration (not condescending) |
| **Honesty** | Never over-promise. "Estimated 3-4 months" not "Get a new job in 30 days!" |

---

## Loading and Empty States

### Loading States

| Screen | Loading Behavior |
| ------ | ---------------- |
| Assessment | Skeleton form with animated shimmer |
| Skills Profile | Skeleton badges with category headers |
| Career Explorer | Skeleton cards (3-6) with shimmer |
| Learning Dashboard | Skeleton course cards with progress bar placeholders |
| Job Board | Skeleton job cards with alternating heights |
| Resume Builder | "Generating your resume..." with progress messages ("Analyzing your experience...", "Reframing for your target career...", "Optimizing keywords...") |

### Empty States

| Screen | Empty State Message | CTA |
| ------ | ------------------- | --- |
| Skills Profile | "Let's discover your skills!" with friendly illustration | "Start Assessment" |
| Career Explorer | "Complete your skills assessment to see career matches" | "Go to Assessment" |
| Learning Dashboard | "Choose a career path to get your personalized plan" | "Explore Careers" |
| Job Board | "Jobs are on their way! We're finding matches for your skills" | "Update Skills" or "Broaden Filters" |
| Resume Builder | "Select a career path to generate your tailored resume" | "Explore Careers" |
| Progress Tracker | "Your journey begins here" with single start node | "Start Assessment" |
| Community Forums | "Be the first to start a conversation!" | "Create Post" |
| Applications | "No applications yet. Browse matched jobs to get started" | "View Jobs" |

---

## Error States

| Error Type | Display | Action |
| ---------- | ------- | ------ |
| Network error | Toast notification: "Connection lost. We'll retry when you're back online." | Auto-retry with exponential backoff |
| AI processing failure | Inline error: "Our AI is taking a bit longer than usual. We'll email you when your results are ready." | Retry button + email notification fallback |
| Form validation | Inline error messages below each field, red border, aria-describedby link | Focus moves to first error field |
| 404 page | Friendly illustration, "This page has moved on to new things. Let's get you back on track." | Link to dashboard home |
| 500 error | Friendly illustration, "Something went wrong on our end. We're working on it." | Retry button + status page link |
| Rate limit | "You're moving fast! Give us a moment to catch up." | Auto-retry after cooldown |
| Subscription required | Feature preview with blur/lock overlay | "Upgrade to Navigator" or "Upgrade to Pro" button |

---

*Every screen designed to answer: "What should I do next?" -- no dead ends, no confusion, just a clear path forward.*
