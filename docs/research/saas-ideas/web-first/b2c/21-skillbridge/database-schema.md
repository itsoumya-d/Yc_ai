# SkillBridge -- Database Schema

## Entity Relationship Summary

```
users 1--1 profiles
users 1--N skills
users 1--N skill_assessments
users 1--N career_paths
users 1--N learning_plans
users 1--N resumes
users 1--N job_matches
users 1--N mentor_sessions (as mentee)
users 1--N mentor_sessions (as mentor)
users 1--1 subscriptions
users 1--N mentors (a user can be a mentor)

career_paths 1--N learning_plans
learning_plans 1--N learning_plan_courses (join)
courses 1--N learning_plan_courses (join)
courses 1--N course_progress

jobs 1--N job_matches

mentors 1--N mentor_sessions
```

---

## Complete SQL DDL

### Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  location_city TEXT,
  location_state TEXT,
  location_zip TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'email',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_industry TEXT,
  current_job_title TEXT,
  years_experience INTEGER DEFAULT 0,
  education_level TEXT,
  is_currently_employed BOOLEAN,
  weekly_learning_hours INTEGER DEFAULT 5,
  course_budget TEXT DEFAULT 'free_only',
  learning_preference TEXT[] DEFAULT '{}',
  career_priorities JSONB DEFAULT '{}',
  assessment_status TEXT NOT NULL DEFAULT 'not_started',
  assessment_step INTEGER DEFAULT 0,
  assessment_data JSONB DEFAULT '{}',
  resume_raw_text TEXT,
  resume_file_url TEXT,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Skills

```sql
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency TEXT NOT NULL DEFAULT 'beginner',
  source TEXT NOT NULL DEFAULT 'questionnaire',
  onet_code TEXT,
  esco_code TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT skills_proficiency_check CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  CONSTRAINT skills_category_check CHECK (category IN ('technical', 'interpersonal', 'analytical', 'physical', 'creative', 'managerial', 'tools', 'certifications')),
  CONSTRAINT skills_source_check CHECK (source IN ('resume', 'questionnaire', 'user_added', 'course_earned'))
);
```

### Skill Assessments

```sql
CREATE TABLE skill_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}',
  result_data JSONB NOT NULL DEFAULT '{}',
  skills_identified INTEGER NOT NULL DEFAULT 0,
  ai_model TEXT,
  ai_tokens_used INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT assessment_type_check CHECK (assessment_type IN ('resume_upload', 'questionnaire', 'combined')),
  CONSTRAINT assessment_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);
```

### Career Paths

```sql
CREATE TABLE career_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  industry TEXT NOT NULL,
  onet_soc_code TEXT,
  transferability_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  salary_entry INTEGER,
  salary_median INTEGER,
  salary_senior INTEGER,
  growth_outlook_percent NUMERIC(5,2),
  current_openings INTEGER DEFAULT 0,
  skills_gap_count INTEGER DEFAULT 0,
  estimated_transition_weeks INTEGER,
  remote_availability_percent INTEGER DEFAULT 0,
  is_saved BOOLEAN NOT NULL DEFAULT FALSE,
  is_selected BOOLEAN NOT NULL DEFAULT FALSE,
  match_details JSONB DEFAULT '{}',
  skills_gap JSONB DEFAULT '[]',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Learning Plans

```sql
CREATE TABLE learning_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  career_path_id UUID NOT NULL REFERENCES career_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  total_courses INTEGER NOT NULL DEFAULT 0,
  completed_courses INTEGER NOT NULL DEFAULT 0,
  total_estimated_hours INTEGER DEFAULT 0,
  overall_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  milestones JSONB DEFAULT '[]',
  generated_by_ai BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT plan_status_check CHECK (status IN ('active', 'paused', 'completed', 'archived'))
);
```

### Courses

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_url TEXT,
  description TEXT,
  duration_hours NUMERIC(6,1),
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  skills_covered TEXT[] DEFAULT '{}',
  rating NUMERIC(3,2),
  review_count INTEGER DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  format TEXT DEFAULT 'video',
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT course_difficulty_check CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  CONSTRAINT course_format_check CHECK (format IN ('video', 'reading', 'hands_on', 'instructor_led', 'mixed'))
);
```

### Learning Plan Courses (Join Table)

```sql
CREATE TABLE learning_plan_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learning_plan_id UUID NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL DEFAULT 0,
  milestone_name TEXT,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (learning_plan_id, course_id)
);
```

### Course Progress

```sql
CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  learning_plan_id UUID REFERENCES learning_plans(id) ON DELETE SET NULL,
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id),
  CONSTRAINT progress_status_check CHECK (status IN ('not_started', 'in_progress', 'completed', 'dropped'))
);
```

### Jobs

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  company_logo_url TEXT,
  location TEXT,
  is_remote BOOLEAN NOT NULL DEFAULT FALSE,
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT,
  required_skills TEXT[] DEFAULT '{}',
  nice_to_have_skills TEXT[] DEFAULT '{}',
  job_type TEXT DEFAULT 'full_time',
  is_career_changer_friendly BOOLEAN NOT NULL DEFAULT FALSE,
  source TEXT NOT NULL DEFAULT 'aggregated',
  source_url TEXT,
  posted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT job_type_check CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship'))
);
```

### Job Matches

```sql
CREATE TABLE job_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  match_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  skills_overlap JSONB DEFAULT '[]',
  skills_missing JSONB DEFAULT '[]',
  match_breakdown JSONB DEFAULT '{}',
  application_status TEXT NOT NULL DEFAULT 'matched',
  applied_at TIMESTAMPTZ,
  interview_at TIMESTAMPTZ,
  notes TEXT,
  is_saved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, job_id),
  CONSTRAINT application_status_check CHECK (application_status IN ('matched', 'saved', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn'))
);
```

### Mentors

```sql
CREATE TABLE mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  origin_career TEXT NOT NULL,
  current_career TEXT NOT NULL,
  current_company TEXT,
  transition_story TEXT,
  years_since_transition INTEGER,
  areas_of_expertise TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT ARRAY['English'],
  availability_status TEXT NOT NULL DEFAULT 'available',
  max_sessions_per_month INTEGER DEFAULT 8,
  session_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  calendar_url TEXT,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT mentor_availability_check CHECK (availability_status IN ('available', 'limited', 'unavailable'))
);
```

### Mentor Sessions

```sql
CREATE TABLE mentor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled',
  session_type TEXT NOT NULL DEFAULT 'text',
  meeting_url TEXT,
  mentee_notes TEXT,
  mentor_notes TEXT,
  rating INTEGER,
  review_text TEXT,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT session_status_check CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  CONSTRAINT session_type_check CHECK (session_type IN ('text', 'video')),
  CONSTRAINT session_rating_check CHECK (rating >= 1 AND rating <= 5)
);
```

### Resumes

```sql
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  career_path_id UUID REFERENCES career_paths(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  template TEXT NOT NULL DEFAULT 'modern',
  content JSONB NOT NULL DEFAULT '{}',
  original_content JSONB DEFAULT '{}',
  professional_summary TEXT,
  is_ats_optimized BOOLEAN NOT NULL DEFAULT FALSE,
  version INTEGER NOT NULL DEFAULT 1,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT resume_template_check CHECK (template IN ('clean', 'modern', 'classic')),
  CONSTRAINT resume_status_check CHECK (status IN ('draft', 'finalized', 'archived'))
);
```

### Subscriptions

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT subscription_plan_check CHECK (plan IN ('free', 'navigator', 'pro')),
  CONSTRAINT subscription_status_check CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing', 'incomplete'))
);
```

---

## Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_assessment_status ON profiles(assessment_status);
CREATE INDEX idx_profiles_search_vector ON profiles USING GIN(search_vector);

-- Skills
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_onet_code ON skills(onet_code);
CREATE INDEX idx_skills_user_category ON skills(user_id, category);

-- Skill Assessments
CREATE INDEX idx_skill_assessments_user_id ON skill_assessments(user_id);
CREATE INDEX idx_skill_assessments_status ON skill_assessments(status);

-- Career Paths
CREATE INDEX idx_career_paths_user_id ON career_paths(user_id);
CREATE INDEX idx_career_paths_score ON career_paths(transferability_score DESC);
CREATE INDEX idx_career_paths_user_saved ON career_paths(user_id, is_saved) WHERE is_saved = TRUE;
CREATE INDEX idx_career_paths_user_selected ON career_paths(user_id, is_selected) WHERE is_selected = TRUE;
CREATE INDEX idx_career_paths_search_vector ON career_paths USING GIN(search_vector);

-- Learning Plans
CREATE INDEX idx_learning_plans_user_id ON learning_plans(user_id);
CREATE INDEX idx_learning_plans_career_path_id ON learning_plans(career_path_id);
CREATE INDEX idx_learning_plans_status ON learning_plans(status);

-- Courses
CREATE INDEX idx_courses_provider ON courses(provider);
CREATE INDEX idx_courses_is_free ON courses(is_free);
CREATE INDEX idx_courses_search_vector ON courses USING GIN(search_vector);
CREATE INDEX idx_courses_skills_covered ON courses USING GIN(skills_covered);

-- Learning Plan Courses
CREATE INDEX idx_lpc_plan_id ON learning_plan_courses(learning_plan_id);
CREATE INDEX idx_lpc_course_id ON learning_plan_courses(course_id);
CREATE INDEX idx_lpc_sequence ON learning_plan_courses(learning_plan_id, sequence_order);

-- Course Progress
CREATE INDEX idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX idx_course_progress_course_id ON course_progress(course_id);
CREATE INDEX idx_course_progress_status ON course_progress(status);
CREATE INDEX idx_course_progress_user_status ON course_progress(user_id, status);

-- Jobs
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_is_remote ON jobs(is_remote);
CREATE INDEX idx_jobs_career_changer_friendly ON jobs(is_career_changer_friendly);
CREATE INDEX idx_jobs_search_vector ON jobs USING GIN(search_vector);
CREATE INDEX idx_jobs_required_skills ON jobs USING GIN(required_skills);
CREATE INDEX idx_jobs_salary ON jobs(salary_min, salary_max);

-- Job Matches
CREATE INDEX idx_job_matches_user_id ON job_matches(user_id);
CREATE INDEX idx_job_matches_job_id ON job_matches(job_id);
CREATE INDEX idx_job_matches_score ON job_matches(match_score DESC);
CREATE INDEX idx_job_matches_user_status ON job_matches(user_id, application_status);

-- Mentors
CREATE INDEX idx_mentors_user_id ON mentors(user_id);
CREATE INDEX idx_mentors_availability ON mentors(availability_status);
CREATE INDEX idx_mentors_rating ON mentors(average_rating DESC);
CREATE INDEX idx_mentors_search_vector ON mentors USING GIN(search_vector);

-- Mentor Sessions
CREATE INDEX idx_mentor_sessions_mentor_id ON mentor_sessions(mentor_id);
CREATE INDEX idx_mentor_sessions_mentee_id ON mentor_sessions(mentee_id);
CREATE INDEX idx_mentor_sessions_scheduled_at ON mentor_sessions(scheduled_at);
CREATE INDEX idx_mentor_sessions_status ON mentor_sessions(status);

-- Resumes
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_career_path_id ON resumes(career_path_id);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

## Row Level Security Policies

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plan_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users: own data only
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Profiles: own data only
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Skills: own data only
CREATE POLICY "Users can manage own skills" ON skills
  FOR ALL USING (auth.uid() = user_id);

-- Skill Assessments: own data only
CREATE POLICY "Users can manage own assessments" ON skill_assessments
  FOR ALL USING (auth.uid() = user_id);

-- Career Paths: own data only
CREATE POLICY "Users can manage own career paths" ON career_paths
  FOR ALL USING (auth.uid() = user_id);

-- Learning Plans: own data only
CREATE POLICY "Users can manage own learning plans" ON learning_plans
  FOR ALL USING (auth.uid() = user_id);

-- Courses: public read for all authenticated users
CREATE POLICY "Authenticated users can view courses" ON courses
  FOR SELECT USING (auth.role() = 'authenticated');

-- Learning Plan Courses: via learning plan ownership
CREATE POLICY "Users can view own plan courses" ON learning_plan_courses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM learning_plans WHERE learning_plans.id = learning_plan_courses.learning_plan_id AND learning_plans.user_id = auth.uid())
  );

-- Course Progress: own data only
CREATE POLICY "Users can manage own progress" ON course_progress
  FOR ALL USING (auth.uid() = user_id);

-- Jobs: public read for all authenticated users
CREATE POLICY "Authenticated users can view jobs" ON jobs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Job Matches: own data only
CREATE POLICY "Users can manage own job matches" ON job_matches
  FOR ALL USING (auth.uid() = user_id);

-- Mentors: public read, own write
CREATE POLICY "Anyone can view mentors" ON mentors
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Mentors can update own profile" ON mentors
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create mentor profile" ON mentors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mentor Sessions: mentor or mentee can view
CREATE POLICY "Participants can view sessions" ON mentor_sessions
  FOR SELECT USING (
    auth.uid() = mentee_id OR
    EXISTS (SELECT 1 FROM mentors WHERE mentors.id = mentor_sessions.mentor_id AND mentors.user_id = auth.uid())
  );
CREATE POLICY "Mentees can create sessions" ON mentor_sessions
  FOR INSERT WITH CHECK (auth.uid() = mentee_id);
CREATE POLICY "Participants can update sessions" ON mentor_sessions
  FOR UPDATE USING (
    auth.uid() = mentee_id OR
    EXISTS (SELECT 1 FROM mentors WHERE mentors.id = mentor_sessions.mentor_id AND mentors.user_id = auth.uid())
  );

-- Resumes: own data only
CREATE POLICY "Users can manage own resumes" ON resumes
  FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: own data only
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

---

## Database Functions and Triggers

### Updated At Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_assessments_updated_at BEFORE UPDATE ON skill_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_paths_updated_at BEFORE UPDATE ON career_paths
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_plans_updated_at BEFORE UPDATE ON learning_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_progress_updated_at BEFORE UPDATE ON course_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_matches_updated_at BEFORE UPDATE ON job_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON mentors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentor_sessions_updated_at BEFORE UPDATE ON mentor_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Full-Text Search Vector Triggers

```sql
-- Profiles search vector
CREATE OR REPLACE FUNCTION update_profiles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.current_job_title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.current_industry, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_search_vector
  BEFORE INSERT OR UPDATE OF current_job_title, current_industry ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_search_vector();

-- Career paths search vector
CREATE OR REPLACE FUNCTION update_career_paths_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.industry, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_career_paths_search_vector
  BEFORE INSERT OR UPDATE OF title, industry ON career_paths
  FOR EACH ROW EXECUTE FUNCTION update_career_paths_search_vector();

-- Courses search vector
CREATE OR REPLACE FUNCTION update_courses_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.provider, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_courses_search_vector
  BEFORE INSERT OR UPDATE OF title, provider, description ON courses
  FOR EACH ROW EXECUTE FUNCTION update_courses_search_vector();

-- Jobs search vector
CREATE OR REPLACE FUNCTION update_jobs_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.company, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_jobs_search_vector
  BEFORE INSERT OR UPDATE OF title, company, description, location ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_jobs_search_vector();

-- Mentors search vector
CREATE OR REPLACE FUNCTION update_mentors_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.origin_career, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.current_career, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.transition_story, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mentors_search_vector
  BEFORE INSERT OR UPDATE OF origin_career, current_career, transition_story ON mentors
  FOR EACH ROW EXECUTE FUNCTION update_mentors_search_vector();
```

### Audit Log

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_subscriptions AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
CREATE TRIGGER audit_resumes AFTER INSERT OR UPDATE OR DELETE ON resumes
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
```

---

## TypeScript Interfaces

```typescript
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  location_city: string | null;
  location_state: string | null;
  location_zip: string | null;
  auth_provider: string;
  email_verified: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  current_industry: string | null;
  current_job_title: string | null;
  years_experience: number;
  education_level: string | null;
  is_currently_employed: boolean | null;
  weekly_learning_hours: number;
  course_budget: string;
  learning_preference: string[];
  career_priorities: Record<string, unknown>;
  assessment_status: 'not_started' | 'in_progress' | 'completed';
  assessment_step: number;
  assessment_data: Record<string, unknown>;
  resume_raw_text: string | null;
  resume_file_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: 'technical' | 'interpersonal' | 'analytical' | 'physical' | 'creative' | 'managerial' | 'tools' | 'certifications';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  source: 'resume' | 'questionnaire' | 'user_added' | 'course_earned';
  onet_code: string | null;
  esco_code: string | null;
  is_verified: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SkillAssessment {
  id: string;
  user_id: string;
  assessment_type: 'resume_upload' | 'questionnaire' | 'combined';
  input_data: Record<string, unknown>;
  result_data: Record<string, unknown>;
  skills_identified: number;
  ai_model: string | null;
  ai_tokens_used: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CareerPath {
  id: string;
  user_id: string;
  title: string;
  industry: string;
  onet_soc_code: string | null;
  transferability_score: number;
  salary_entry: number | null;
  salary_median: number | null;
  salary_senior: number | null;
  growth_outlook_percent: number | null;
  current_openings: number;
  skills_gap_count: number;
  estimated_transition_weeks: number | null;
  remote_availability_percent: number;
  is_saved: boolean;
  is_selected: boolean;
  match_details: Record<string, unknown>;
  skills_gap: unknown[];
  created_at: string;
  updated_at: string;
}

export interface LearningPlan {
  id: string;
  user_id: string;
  career_path_id: string;
  title: string;
  description: string | null;
  total_courses: number;
  completed_courses: number;
  total_estimated_hours: number;
  overall_progress: number;
  status: 'active' | 'paused' | 'completed' | 'archived';
  milestones: unknown[];
  generated_by_ai: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  provider_url: string | null;
  description: string | null;
  duration_hours: number | null;
  cost: number;
  currency: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  skills_covered: string[];
  rating: number | null;
  review_count: number;
  is_free: boolean;
  format: 'video' | 'reading' | 'hands_on' | 'instructor_led' | 'mixed';
  thumbnail_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  learning_plan_id: string | null;
  progress_percent: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'dropped';
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  time_spent_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  external_id: string | null;
  title: string;
  company: string;
  company_logo_url: string | null;
  location: string | null;
  is_remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  description: string | null;
  required_skills: string[];
  nice_to_have_skills: string[];
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  is_career_changer_friendly: boolean;
  source: string;
  source_url: string | null;
  posted_at: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface JobMatch {
  id: string;
  user_id: string;
  job_id: string;
  match_score: number;
  skills_overlap: unknown[];
  skills_missing: unknown[];
  match_breakdown: Record<string, unknown>;
  application_status: 'matched' | 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';
  applied_at: string | null;
  interview_at: string | null;
  notes: string | null;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Mentor {
  id: string;
  user_id: string;
  origin_career: string;
  current_career: string;
  current_company: string | null;
  transition_story: string | null;
  years_since_transition: number | null;
  areas_of_expertise: string[];
  languages: string[];
  availability_status: 'available' | 'limited' | 'unavailable';
  max_sessions_per_month: number;
  session_count: number;
  average_rating: number;
  total_reviews: number;
  is_verified: boolean;
  calendar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  session_type: 'text' | 'video';
  meeting_url: string | null;
  mentee_notes: string | null;
  mentor_notes: string | null;
  rating: number | null;
  review_text: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  career_path_id: string | null;
  title: string;
  template: 'clean' | 'modern' | 'classic';
  content: Record<string, unknown>;
  original_content: Record<string, unknown>;
  professional_summary: string | null;
  is_ats_optimized: boolean;
  version: number;
  pdf_url: string | null;
  status: 'draft' | 'finalized' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'navigator' | 'pro';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  trial_end: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
```

---

## Seed Data

```sql
-- Subscription plans reference data
INSERT INTO subscriptions (id, user_id, plan, status) VALUES
  -- Seeded via Stripe webhook on user signup; free plan created on registration

-- Sample courses from providers
INSERT INTO courses (title, provider, provider_url, description, duration_hours, cost, is_free, difficulty_level, format, skills_covered) VALUES
  ('Google Data Analytics Certificate', 'Coursera', 'https://coursera.org/google-data-analytics', 'Prepare for a career in data analytics', 180, 0, TRUE, 'beginner', 'video', ARRAY['data analysis', 'spreadsheets', 'SQL', 'Tableau', 'R']),
  ('Project Management Foundations', 'LinkedIn Learning', 'https://linkedin.com/learning/project-management-foundations', 'Learn the fundamentals of project management', 8, 29.99, FALSE, 'beginner', 'video', ARRAY['project management', 'agile', 'planning']),
  ('Introduction to Computer Science', 'freeCodeCamp', 'https://freecodecamp.org/learn', 'Learn computer science basics through hands-on coding', 300, 0, TRUE, 'beginner', 'hands_on', ARRAY['programming', 'HTML', 'CSS', 'JavaScript']),
  ('Customer Success Management', 'Udemy', 'https://udemy.com/customer-success', 'Master customer success strategies', 12, 49.99, FALSE, 'intermediate', 'video', ARRAY['customer success', 'communication', 'account management']),
  ('Excel for Business', 'Khan Academy', 'https://khanacademy.org/computing/excel', 'Master Excel for data-driven business decisions', 20, 0, TRUE, 'beginner', 'mixed', ARRAY['Excel', 'data analysis', 'spreadsheets']),
  ('Agile Project Management with Scrum', 'Coursera', 'https://coursera.org/agile-scrum', 'Learn Scrum framework for agile project delivery', 24, 0, TRUE, 'intermediate', 'video', ARRAY['agile', 'scrum', 'project management', 'leadership']),
  ('Technical Writing for Beginners', 'Udemy', 'https://udemy.com/technical-writing', 'Clear and effective technical documentation', 10, 19.99, FALSE, 'beginner', 'video', ARRAY['technical writing', 'communication', 'documentation']),
  ('SQL for Data Science', 'edX', 'https://edx.org/sql-data-science', 'Learn SQL for querying and analyzing data', 30, 0, TRUE, 'beginner', 'hands_on', ARRAY['SQL', 'databases', 'data analysis']);
```

---

## Migration Strategy

### File Naming Convention

```
migrations/
  001_create_extensions.sql
  002_create_users.sql
  003_create_profiles.sql
  004_create_skills.sql
  005_create_skill_assessments.sql
  006_create_career_paths.sql
  007_create_learning_plans.sql
  008_create_courses.sql
  009_create_learning_plan_courses.sql
  010_create_course_progress.sql
  011_create_jobs.sql
  012_create_job_matches.sql
  013_create_mentors.sql
  014_create_mentor_sessions.sql
  015_create_resumes.sql
  016_create_subscriptions.sql
  017_create_audit_log.sql
  018_create_indexes.sql
  019_create_rls_policies.sql
  020_create_functions_and_triggers.sql
  021_seed_courses.sql
```

### Execution Order

1. Extensions (uuid-ossp, pgcrypto)
2. Core tables in dependency order (users first, then tables referencing users)
3. Join tables after both referenced tables exist
4. Audit log table
5. Indexes on all tables
6. RLS policies enabling row-level security
7. Functions and triggers (updated_at, search vectors, audit)
8. Seed data (courses, reference data)

### Supabase CLI Commands

```bash
supabase migration new create_extensions
supabase migration new create_users
# ... one migration per table
supabase db push          # Apply migrations to remote
supabase db reset         # Reset local DB and re-run all migrations
```
