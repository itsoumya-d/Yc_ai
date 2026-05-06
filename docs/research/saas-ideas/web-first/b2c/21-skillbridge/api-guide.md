# SkillBridge -- API Integration Guide

## API Overview

SkillBridge integrates with multiple external APIs to power its AI career transition engine. This guide covers setup, authentication, pricing, code samples, cost projections, and alternatives for each integration.

| API | Purpose | Cost | Auth Method |
| --- | ------- | ---- | ----------- |
| OpenAI | Skills extraction, career matching, resume rewriting, mock interviews | Pay-per-use | API key |
| O*NET Web Services | Occupation data, skills requirements, career details | Free | API key (free registration) |
| BLS Public Data | Employment projections, wage data, labor statistics | Free | API key (free registration) |
| LinkedIn | Profile import, job postings | Partnership | OAuth 2.0 |
| Coursera / Udemy | Course catalog integration | Partnership / Free | API key / Affiliate |
| Indeed / ZipRecruiter | Job listings | Pay-per-use / Partnership | API key |
| SendGrid | Transactional and marketing emails | Freemium | API key |
| Stripe | Subscription billing, payments | Pay-per-use | API key |

---

## 1. OpenAI API

### Overview

OpenAI powers the core AI functionality of SkillBridge: skills extraction from resumes, career path recommendations, resume rewriting, learning plan generation, and mock interviews.

### Pricing (as of 2025)

| Model | Input Cost | Output Cost | Context Window |
| ----- | ---------- | ----------- | -------------- |
| **GPT-4 Turbo** | $10.00 / 1M tokens | $30.00 / 1M tokens | 128K tokens |
| **GPT-4o** | $2.50 / 1M tokens | $10.00 / 1M tokens | 128K tokens |
| **GPT-4o Mini** | $0.15 / 1M tokens | $0.60 / 1M tokens | 128K tokens |
| **GPT-3.5 Turbo** | $0.50 / 1M tokens | $1.50 / 1M tokens | 16K tokens |

**Recommended:** GPT-4o for primary tasks (skills extraction, career recommendation, resume rewriting). GPT-4o Mini for lower-stakes tasks (email content, simple suggestions). GPT-4 Turbo for complex mock interview conversations.

### Setup

```bash
npm install openai
```

```typescript
// lib/openai/client.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
```

### Code Samples

**Skills Extraction (Structured Output):**

```typescript
// lib/openai/skills-extraction.ts
import openai from './client';
import { z } from 'zod';

const SkillSchema = z.object({
  name: z.string(),
  category: z.enum([
    'technical', 'interpersonal', 'analytical',
    'management', 'physical', 'creative', 'tools'
  ]),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  evidence: z.string(), // quote from resume supporting this skill
});

const SkillsExtractionSchema = z.object({
  skills: z.array(SkillSchema),
  summary: z.string(),
  years_of_experience: z.number(),
  industries: z.array(z.string()),
});

export async function extractSkillsFromResume(resumeText: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a career counselor AI specializing in identifying
transferable skills. Analyze the resume text and extract ALL skills,
including ones the person might not realize they have. Be generous
in identifying skills -- these are people who often underestimate
their capabilities. Categorize each skill and assess proficiency
based on the context. Return JSON matching the provided schema.`
      },
      {
        role: 'user',
        content: `Extract transferable skills from this resume:\n\n${resumeText}`
      }
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const parsed = JSON.parse(completion.choices[0].message.content || '{}');
  return SkillsExtractionSchema.parse(parsed);
}
```

**Career Path Recommendation:**

```typescript
// lib/openai/career-recommendation.ts
import openai from './client';

interface SkillProfile {
  skills: Array<{ name: string; category: string; proficiency: string }>;
  industries: string[];
  yearsExperience: number;
  preferences: {
    salaryMinimum: number;
    remotePreference: string;
    learningBudget: string;
    hoursPerWeek: number;
  };
}

export async function recommendCareerPaths(
  profile: SkillProfile,
  onetData: string // pre-fetched O*NET occupation data
) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a career transition advisor. Given a worker's skill
profile and O*NET occupation data, recommend the TOP 10 career paths
that best match their transferable skills. For each recommendation:
1. Explain WHY their skills transfer
2. Identify the specific skills gap
3. Estimate realistic upskilling time
4. Be honest about challenges but encouraging about possibilities.
Return JSON with an array of career recommendations.`
      },
      {
        role: 'user',
        content: `Skill Profile:\n${JSON.stringify(profile, null, 2)}
\n\nO*NET Occupation Data:\n${onetData}`
      }
    ],
    temperature: 0.4,
    max_tokens: 3000,
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}
```

**Resume Rewriting:**

```typescript
// lib/openai/resume-rewriter.ts
import openai from './client';

export async function rewriteResume(
  originalResume: string,
  targetCareer: string,
  targetIndustryKeywords: string[]
) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert resume writer specializing in career
transitions. Rewrite the resume to position this person for a
${targetCareer} role. Rules:
1. NEVER fabricate experience or skills they don't have
2. Reframe existing experience using ${targetCareer} industry language
3. Highlight transferable skills prominently
4. Write a compelling professional summary for a career changer
5. Use keywords: ${targetIndustryKeywords.join(', ')}
6. Make it ATS-friendly (no tables, columns, or special characters)
7. Quantify achievements wherever possible`
      },
      {
        role: 'user',
        content: `Original resume:\n\n${originalResume}`
      }
    ],
    temperature: 0.5,
    max_tokens: 2500,
  });

  return completion.choices[0].message.content;
}
```

**Mock Interview (Streaming):**

```typescript
// app/api/interview/route.ts
import openai from '@/lib/openai/client';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export async function POST(req: Request) {
  const { messages, targetCareer, jobDescription } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are a friendly but thorough interviewer conducting a
mock interview for a ${targetCareer} position. The candidate is a
career changer. Ask relevant behavioral and situational questions.
After each answer, provide constructive feedback using the STAR
method. Be encouraging but honest. Job description: ${jobDescription}`
      },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

### Cost Projections

| Use Case | Est. Tokens/Request | Model | Cost/Request | Monthly (10K users) |
| -------- | ------------------- | ----- | ------------ | ------------------- |
| Skills extraction | ~2,000 in + ~1,500 out | GPT-4o | $0.02 | $200 |
| Career recommendation | ~3,000 in + ~2,000 out | GPT-4o | $0.03 | $150 (once per user) |
| Resume rewrite | ~2,500 in + ~2,000 out | GPT-4o | $0.03 | $300 |
| Learning plan | ~2,000 in + ~1,500 out | GPT-4o Mini | $0.001 | $10 |
| Mock interview (per session) | ~5,000 in + ~3,000 out | GPT-4 Turbo | $0.14 | $700 (5K sessions) |
| **Total estimated** | | | | **~$1,360/mo at 10K MAU** |

### Alternatives

| Alternative | Pros | Cons |
| ----------- | ---- | ---- |
| **Anthropic Claude** | Strong reasoning, longer context, safety-focused | Less structured output support, smaller ecosystem |
| **Google Gemini** | Competitive pricing, multimodal | Less mature API, variable quality |
| **Open-source (Llama, Mistral)** | No per-token cost, full control | Requires self-hosting, lower quality for complex tasks |
| **Cohere** | Good for embeddings and search | Weaker for generation tasks |

---

## 2. O*NET Web Services API

### Overview

O*NET (Occupational Information Network) is the US government's comprehensive database of occupation information. It is the backbone of SkillBridge's skills taxonomy and career matching.

### Pricing

**Free.** Government-funded, no usage fees. Requires free registration for API key.

### Setup

Register at: https://services.onetcenter.org/

```typescript
// lib/onet/client.ts
const ONET_BASE_URL = 'https://services.onetcenter.org/ws';

const headers = {
  'Authorization': `Basic ${Buffer.from(
    `${process.env.ONET_USERNAME}:${process.env.ONET_PASSWORD}`
  ).toString('base64')}`,
  'Accept': 'application/json',
};

export async function onetFetch(endpoint: string) {
  const response = await fetch(`${ONET_BASE_URL}${endpoint}`, { headers });
  if (!response.ok) throw new Error(`O*NET API error: ${response.status}`);
  return response.json();
}
```

### Code Samples

**Search Occupations:**

```typescript
// lib/onet/occupations.ts
import { onetFetch } from './client';

export async function searchOccupations(keyword: string) {
  const data = await onetFetch(
    `/online/search?keyword=${encodeURIComponent(keyword)}&start=1&end=20`
  );
  return data.occupation; // Array of { code, title, relevance_score }
}
```

**Get Occupation Skills:**

```typescript
export async function getOccupationSkills(socCode: string) {
  const data = await onetFetch(`/online/occupations/${socCode}/summary/skills`);
  return data.element.map((skill: any) => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    importance: skill.score.value, // 0-100
    level: skill.score.value,
  }));
}
```

**Get Occupation Details:**

```typescript
export async function getOccupationDetails(socCode: string) {
  const [summary, skills, knowledge, abilities, tasks, wages] =
    await Promise.all([
      onetFetch(`/online/occupations/${socCode}`),
      onetFetch(`/online/occupations/${socCode}/summary/skills`),
      onetFetch(`/online/occupations/${socCode}/summary/knowledge`),
      onetFetch(`/online/occupations/${socCode}/summary/abilities`),
      onetFetch(`/online/occupations/${socCode}/summary/tasks`),
      onetFetch(`/online/occupations/${socCode}/summary/wages`),
    ]);

  return { summary, skills, knowledge, abilities, tasks, wages };
}
```

### Key Endpoints

| Endpoint | Returns |
| -------- | ------- |
| `/online/search?keyword=X` | Occupation search results |
| `/online/occupations/{code}` | Occupation summary (title, description) |
| `/online/occupations/{code}/summary/skills` | Required skills with importance scores |
| `/online/occupations/{code}/summary/knowledge` | Required knowledge areas |
| `/online/occupations/{code}/summary/abilities` | Required abilities |
| `/online/occupations/{code}/summary/tasks` | Typical tasks |
| `/online/occupations/{code}/summary/technology_skills` | Technology/tools used |
| `/online/occupations/{code}/summary/wages` | Salary data |
| `/online/occupations/{code}/summary/job_outlook` | Growth projections |
| `/online/occupations/{code}/related_occupations` | Similar/related careers |

### Rate Limits

- No official rate limit published, but recommended to cache responses
- Cache O*NET data in Redis (Upstash) with 24-hour TTL
- Full database download available for offline use (updated quarterly)

### Alternatives

| Alternative | Notes |
| ----------- | ----- |
| **ESCO (European Commission)** | European equivalent. Use for international expansion |
| **Lightcast (formerly Burning Glass)** | Commercial, real-time labor market data. Expensive but more current |
| **LinkedIn Economic Graph** | Real-time skills data. Requires partnership |

---

## 3. BLS (Bureau of Labor Statistics) API

### Overview

BLS provides authoritative employment projections, wage data, and labor market statistics for the US. Essential for career path salary ranges and growth outlooks.

### Pricing

**Free.** Government API. Registration recommended for higher rate limits.

### Setup

Register at: https://data.bls.gov/registrationEngine/

```typescript
// lib/bls/client.ts
const BLS_BASE_URL = 'https://api.bls.gov/publicAPI/v2';

export async function blsFetch(seriesIds: string[], startYear: number, endYear: number) {
  const response = await fetch(`${BLS_BASE_URL}/timeseries/data/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seriesid: seriesIds,
      startyear: startYear.toString(),
      endyear: endYear.toString(),
      registrationkey: process.env.BLS_API_KEY,
    }),
  });

  if (!response.ok) throw new Error(`BLS API error: ${response.status}`);
  return response.json();
}
```

### Code Samples

**Get Employment Data by Occupation:**

```typescript
// lib/bls/employment.ts
import { blsFetch } from './client';

// BLS series ID format for occupation employment: OEU + area + industry + occupation + datatype
export async function getOccupationWages(occupationCode: string, areaCode: string = '0000000') {
  // Series for annual mean wage
  const seriesId = `OEUN${areaCode}000000${occupationCode}04`;

  const data = await blsFetch([seriesId], 2020, 2025);
  return data.Results.series[0]?.data.map((point: any) => ({
    year: point.year,
    period: point.period,
    value: parseFloat(point.value),
  }));
}
```

**Get Employment Projections:**

```typescript
export async function getEmploymentProjections(occupationCode: string) {
  // Employment projections series
  const data = await blsFetch(
    [`ENU${occupationCode}000000000001`],
    2022,
    2032
  );

  return {
    currentEmployment: data.Results.series[0]?.data[0]?.value,
    projectedEmployment: data.Results.series[0]?.data[data.Results.series[0]?.data.length - 1]?.value,
    growthRate: calculateGrowthRate(data),
  };
}
```

### Rate Limits

| Tier | Daily Limit | Per Query Series |
| ---- | ----------- | ---------------- |
| Unregistered | 25 requests/day | 25 series |
| Registered (free) | 500 requests/day | 50 series |

**Strategy:** Batch requests (up to 50 series per call), cache aggressively (BLS data updates monthly/quarterly), pre-fetch popular occupation data.

### Alternatives

| Alternative | Notes |
| ----------- | ----- |
| **Lightcast** | Real-time, more granular, but expensive ($20K+/year) |
| **Indeed Hiring Lab** | Free research data, less structured |
| **Census Bureau API** | Additional demographic and geographic data |

---

## 4. LinkedIn API

### Overview

LinkedIn API access is highly restricted. Useful for profile import (if available) and job postings.

### Pricing

**Partnership required.** LinkedIn restricts API access to approved partners.

- **Sign In with LinkedIn (OpenID Connect):** Free, available to all developers
- **Marketing API / People API:** Requires LinkedIn Partner Program membership
- **Job Posting API:** Requires LinkedIn Recruiter license or partnership

### Setup

```typescript
// lib/linkedin/auth.ts
// LinkedIn Sign In with OpenID Connect
export function getLinkedInAuthUrl() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
    scope: 'openid profile email',
    state: generateRandomState(),
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}
```

### Profile Import (Limited)

```typescript
// lib/linkedin/profile.ts
export async function getLinkedInProfile(accessToken: string) {
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  return response.json();
  // Returns: sub, name, email, picture
  // NOTE: Full profile data (experience, skills) requires Partner Program
}
```

### Alternatives for Profile Import

| Alternative | Approach |
| ----------- | -------- |
| **Resume upload** | Primary path. Users upload PDF resume instead |
| **Manual questionnaire** | Guided questions capture equivalent data |
| **Chrome extension** | Future: browser extension that parses LinkedIn profile page (with user consent) |

---

## 5. Course Provider APIs (Coursera / Udemy)

### Coursera

**Access:** Coursera Affiliate API or Coursera for Business API (partnership required).

**Affiliate Program:**
- Commission: 15-45% on course purchases
- Access: course catalog, search, category browsing
- Apply at: https://about.coursera.org/affiliates

```typescript
// lib/courses/coursera.ts
const COURSERA_BASE = 'https://api.coursera.org/api';

export async function searchCourseraCourses(query: string) {
  const response = await fetch(
    `${COURSERA_BASE}/courses.v1?q=search&query=${encodeURIComponent(query)}&includes=instructorIds,partnerIds&fields=name,slug,description,photoUrl,workload,domainTypes`,
    {
      headers: { 'Authorization': `Bearer ${process.env.COURSERA_API_KEY}` },
    }
  );

  const data = await response.json();
  return data.elements.map((course: any) => ({
    id: course.id,
    title: course.name,
    slug: course.slug,
    description: course.description,
    workload: course.workload,
    url: `https://www.coursera.org/learn/${course.slug}`,
    provider: 'coursera',
    cost: 'Free (audit) / $49-79 (certificate)',
  }));
}
```

### Udemy

**Access:** Udemy Affiliate API (free registration through affiliate networks).

**Affiliate Program:**
- Commission: 10-15% on purchases
- Access: course catalog, search, pricing, ratings
- Apply through Impact.com or Rakuten

```typescript
// lib/courses/udemy.ts
const UDEMY_BASE = 'https://www.udemy.com/api-2.0';

export async function searchUdemyCourses(query: string) {
  const response = await fetch(
    `${UDEMY_BASE}/courses/?search=${encodeURIComponent(query)}&page_size=20&ordering=relevance`,
    {
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${process.env.UDEMY_CLIENT_ID}:${process.env.UDEMY_CLIENT_SECRET}`
        ).toString('base64')}`,
        'Accept': 'application/json, text/plain, */*',
      },
    }
  );

  const data = await response.json();
  return data.results.map((course: any) => ({
    id: course.id,
    title: course.title,
    url: `https://www.udemy.com${course.url}`,
    price: course.price,
    rating: course.avg_rating,
    numReviews: course.num_reviews,
    duration: course.content_info,
    provider: 'udemy',
  }));
}
```

### Free Course Providers (No API Required)

| Provider | Integration Method | Cost |
| -------- | ------------------ | ---- |
| **Khan Academy** | Curated link database (no public API) | Free |
| **freeCodeCamp** | Curated link database, GitHub curriculum | Free |
| **edX** | Affiliate API (similar to Coursera) | Free (audit) |
| **YouTube** | YouTube Data API v3 (free, quota-limited) | Free |
| **MIT OpenCourseWare** | RSS feeds, curated links | Free |

### Cost Projections (Course APIs)

- Course API access: Free (affiliate model)
- Revenue: 10-45% commission on course purchases made through SkillBridge
- Estimated commission revenue: $2-5 per course purchase, ~$2,000-5,000/month at 10K users

---

## 6. Job Board APIs (Indeed / ZipRecruiter)

### Indeed

**Access:** Indeed Publisher Program (apply at: https://www.indeed.com/publisher).

**Pricing:** Revenue share model. Indeed pays per click on job listings ($0.25-1.50 per click).

```typescript
// lib/jobs/indeed.ts
const INDEED_BASE = 'https://api.indeed.com/ads/apisearch';

export async function searchIndeedJobs(params: {
  query: string;
  location: string;
  radius: number;
  salary?: string;
}) {
  const searchParams = new URLSearchParams({
    publisher: process.env.INDEED_PUBLISHER_ID!,
    q: params.query,
    l: params.location,
    radius: params.radius.toString(),
    sort: 'relevance',
    format: 'json',
    v: '2',
    limit: '25',
    fromage: '30', // jobs posted within last 30 days
    ...(params.salary && { salary: params.salary }),
  });

  const response = await fetch(`${INDEED_BASE}?${searchParams}`);
  const data = await response.json();

  return data.results.map((job: any) => ({
    id: job.jobkey,
    title: job.jobtitle,
    company: job.company,
    location: job.formattedLocation,
    description: job.snippet,
    url: job.url,
    salary: job.formattedRelativeTime,
    postedDate: job.date,
    source: 'indeed',
  }));
}
```

### ZipRecruiter

**Access:** ZipRecruiter Job Search API (apply at partner program).

**Pricing:** Partnership-based. Revenue share on successful placements or CPC model.

```typescript
// lib/jobs/ziprecruiter.ts
const ZR_BASE = 'https://api.ziprecruiter.com/jobs/v1';

export async function searchZipRecruiterJobs(params: {
  search: string;
  location: string;
  radius_miles: number;
  days_ago?: number;
}) {
  const searchParams = new URLSearchParams({
    search: params.search,
    location: params.location,
    radius_miles: params.radius_miles.toString(),
    days_ago: (params.days_ago || 30).toString(),
    jobs_per_page: '25',
    api_key: process.env.ZIPRECRUITER_API_KEY!,
  });

  const response = await fetch(`${ZR_BASE}?${searchParams}`);
  const data = await response.json();

  return data.jobs.map((job: any) => ({
    id: job.id,
    title: job.name,
    company: job.hiring_company?.name,
    location: job.location,
    description: job.snippet,
    url: job.url,
    salary: job.salary_source === 'predicted'
      ? `Est. ${job.salary_min_annual}-${job.salary_max_annual}`
      : job.salary_interval,
    postedDate: job.posted_time,
    source: 'ziprecruiter',
  }));
}
```

### Job Aggregation Layer

```typescript
// lib/jobs/aggregator.ts
import { searchIndeedJobs } from './indeed';
import { searchZipRecruiterJobs } from './ziprecruiter';

export async function searchAllJobs(params: {
  query: string;
  location: string;
  radius: number;
}) {
  const [indeedJobs, zipJobs] = await Promise.allSettled([
    searchIndeedJobs(params),
    searchZipRecruiterJobs({
      search: params.query,
      location: params.location,
      radius_miles: params.radius,
    }),
  ]);

  const allJobs = [
    ...(indeedJobs.status === 'fulfilled' ? indeedJobs.value : []),
    ...(zipJobs.status === 'fulfilled' ? zipJobs.value : []),
  ];

  // Deduplicate by title + company
  return deduplicateJobs(allJobs);
}
```

### Alternatives

| Alternative | Notes |
| ----------- | ----- |
| **Adzuna API** | Free tier available, global coverage |
| **The Muse API** | Company culture data + jobs, free tier |
| **Jooble API** | Free, large aggregator |
| **Google Jobs API** | No public API, but structured data integration |
| **Direct employer partnerships** | Build relationships with career-changer-friendly employers for direct job feeds |

---

## 7. SendGrid

### Overview

SendGrid handles all transactional and marketing emails: progress summaries, course reminders, job alerts, and onboarding sequences.

### Pricing

| Tier | Monthly Price | Emails/Month | Features |
| ---- | ------------- | ------------ | -------- |
| **Free** | $0 | 100/day | API access, basic templates |
| **Essentials** | $19.95 | 50,000 | Custom templates, analytics, delivery optimization |
| **Pro** | $89.95 | 100,000 | Dedicated IP, advanced analytics, subuser management |

**Recommended:** Start with Essentials ($19.95/mo). Upgrade to Pro when sending >50K emails/month.

### Setup

```bash
npm install @sendgrid/mail
```

```typescript
// lib/email/client.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export default sgMail;
```

### Code Samples

**Weekly Progress Email:**

```typescript
// lib/email/progress-summary.ts
import sgMail from './client';

interface ProgressData {
  userName: string;
  email: string;
  coursesCompleted: number;
  skillsEarned: string[];
  nextMilestone: string;
  progressPercent: number;
  jobMatchesCount: number;
}

export async function sendWeeklyProgress(data: ProgressData) {
  await sgMail.send({
    to: data.email,
    from: {
      email: 'progress@skillbridge.app',
      name: 'SkillBridge',
    },
    templateId: process.env.SENDGRID_PROGRESS_TEMPLATE_ID!,
    dynamicTemplateData: {
      name: data.userName,
      courses_completed: data.coursesCompleted,
      skills_earned: data.skillsEarned,
      next_milestone: data.nextMilestone,
      progress_percent: data.progressPercent,
      job_matches: data.jobMatchesCount,
      subject: `Your weekly progress: ${data.progressPercent}% toward your new career`,
    },
  });
}
```

**Job Alert Email:**

```typescript
// lib/email/job-alert.ts
import sgMail from './client';

export async function sendJobAlert(
  email: string,
  name: string,
  jobs: Array<{ title: string; company: string; matchScore: number; url: string }>
) {
  await sgMail.send({
    to: email,
    from: {
      email: 'jobs@skillbridge.app',
      name: 'SkillBridge Jobs',
    },
    templateId: process.env.SENDGRID_JOB_ALERT_TEMPLATE_ID!,
    dynamicTemplateData: {
      name,
      jobs: jobs.slice(0, 5), // Top 5 matches
      total_matches: jobs.length,
      subject: `${jobs.length} new jobs match your skills`,
    },
  });
}
```

### Alternatives

| Alternative | Price | Notes |
| ----------- | ----- | ----- |
| **Resend** | Free (3K/mo), $20/mo (50K) | Modern API, React email templates, great DX |
| **AWS SES** | $0.10 per 1K emails | Cheapest at scale, more setup required |
| **Postmark** | $15/mo (10K emails) | Best deliverability, transactional focus |
| **Mailgun** | $35/mo (50K emails) | Good API, strong analytics |

---

## 8. Stripe

### Overview

Stripe handles subscription billing for individual plans (Navigator, Pro) and employer plans.

### Pricing

| Fee Type | Rate |
| -------- | ---- |
| **Transaction fee** | 2.9% + $0.30 per charge |
| **Recurring billing** | No additional fee (included) |
| **Invoicing** | No additional fee |
| **International cards** | +1% additional |
| **Currency conversion** | +1% additional |

### Setup

```bash
npm install stripe @stripe/stripe-js
```

```typescript
// lib/stripe/client.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});
```

### Code Samples

**Create Checkout Session:**

```typescript
// app/api/checkout/route.ts
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

const PRICE_IDS = {
  navigator_monthly: process.env.STRIPE_NAVIGATOR_PRICE_ID!,
  navigator_yearly: process.env.STRIPE_NAVIGATOR_YEARLY_PRICE_ID!,
  pro_monthly: process.env.STRIPE_PRO_PRICE_ID!,
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
};

export async function POST(req: Request) {
  const { plan, interval } = await req.json();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return new Response('Unauthorized', { status: 401 });

  const priceId = PRICE_IDS[`${plan}_${interval}` as keyof typeof PRICE_IDS];

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/settings/subscription?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
    metadata: { userId: user.id, plan },
    subscription_data: {
      trial_period_days: 7, // 7-day free trial
    },
  });

  return Response.json({ url: session.url });
}
```

**Webhook Handler:**

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  const supabase = createClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      await supabase
        .from('users')
        .update({ subscription_tier: session.metadata?.plan })
        .eq('id', session.metadata?.userId);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      // Downgrade to free tier
      await supabase
        .from('users')
        .update({ subscription_tier: 'free' })
        .eq('stripe_customer_id', subscription.customer);
      break;
    }
  }

  return new Response('OK', { status: 200 });
}
```

### Alternatives

| Alternative | Notes |
| ----------- | ----- |
| **Paddle** | Handles tax compliance (VAT, sales tax). Higher fees |
| **LemonSqueezy** | Simple, Paddle alternative, good for SaaS. MoR (Merchant of Record) |
| **RevenueCat** | Best for mobile subscription billing |

---

## Cost Summary (Projected Monthly at Scale)

### At 1,000 MAU (Launch)

| Service | Monthly Cost |
| ------- | ------------ |
| OpenAI API | $50-100 |
| O*NET API | Free |
| BLS API | Free |
| SendGrid | $19.95 (Essentials) |
| Stripe | ~$45 (transaction fees on ~$1,500 revenue) |
| **Total API costs** | **~$115-165** |

### At 10,000 MAU (Growth)

| Service | Monthly Cost |
| ------- | ------------ |
| OpenAI API | $1,000-1,500 |
| O*NET API | Free |
| BLS API | Free |
| SendGrid | $89.95 (Pro) |
| Stripe | ~$600 (transaction fees on ~$20,000 revenue) |
| Indeed/ZipRecruiter | Revenue share (net positive) |
| **Total API costs** | **~$1,700-2,200** |

### At 100,000 MAU (Scale)

| Service | Monthly Cost |
| ------- | ------------ |
| OpenAI API | $8,000-12,000 |
| O*NET API | Free |
| BLS API | Free |
| SendGrid | $449 (Premier) |
| Stripe | ~$6,000 (transaction fees on ~$200,000 revenue) |
| Custom ML hosting | $2,000-5,000 |
| **Total API costs** | **~$16,500-23,500** |

API costs remain well under 15% of revenue at all scale stages, indicating healthy unit economics.

---

*All code samples are TypeScript-first, type-safe, and designed for the Next.js + Supabase architecture.*
