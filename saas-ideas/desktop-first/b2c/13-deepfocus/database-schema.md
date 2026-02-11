# DeepFocus -- Database Schema

> Complete database schema for the AI adaptive focus work environment. Supabase (PostgreSQL) for cloud sync and team features, with local SQLite for offline session tracking.

---

## Entity Relationship Summary

```
users
  |-- 1:N -- focus_sessions
  |-- 1:N -- goals
  |-- 1:N -- blocking_rules
  |-- 1:N -- soundscape_presets (custom)
  |-- 1:1 -- streaks
  |-- 1:N -- subscriptions
  |-- N:M -- teams (via team_members)
  |-- N:M -- co_focus_rooms (via room_participants)
  |
  focus_sessions
    |-- 1:1 -- session_analytics
    |-- 1:N -- app_usage (blocked apps log)
  |
  teams
    |-- 1:N -- co_focus_rooms
  |
  soundscapes (global reference)
```

**Key relationships:**
- A **user** runs multiple **focus sessions**, each tracked with detailed **session analytics**
- **App usage** logs every distraction attempt during a session
- **Blocking rules** define per-user app/website blocking behavior
- **Soundscapes** are global; users create custom **soundscape presets** (mixes)
- **Streaks** track consecutive focus days per user
- **Goals** set daily/weekly focus time targets
- **Teams** and **co-focus rooms** enable social accountability features

---

## Complete SQL DDL

### Users Table

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    work_type TEXT DEFAULT 'developer' CHECK (work_type IN ('developer', 'writer', 'designer', 'researcher', 'student', 'other')),
    peak_focus_time TEXT DEFAULT 'morning' CHECK (peak_focus_time IN ('early_morning', 'late_morning', 'afternoon', 'evening', 'night')),
    typical_focus_duration INTEGER DEFAULT 25,
    biggest_distraction TEXT DEFAULT 'social_media',
    day_start_hour INTEGER DEFAULT 9 CHECK (day_start_hour >= 0 AND day_start_hour <= 23),
    timezone TEXT DEFAULT 'UTC',
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    notification_daily_report BOOLEAN DEFAULT true,
    notification_weekly_report BOOLEAN DEFAULT true,
    notification_daily_report_time TEXT DEFAULT '18:00',
    notification_weekly_report_day TEXT DEFAULT 'sunday',
    keep_data_local_only BOOLEAN DEFAULT false,
    data_retention_days INTEGER DEFAULT 365,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Focus Sessions Table

```sql
CREATE TABLE public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL DEFAULT '',
    task_category TEXT DEFAULT 'other' CHECK (task_category IN ('coding', 'writing', 'design', 'research', 'admin', 'study', 'other')),
    planned_duration_minutes INTEGER NOT NULL DEFAULT 25,
    actual_duration_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    paused_duration_seconds INTEGER DEFAULT 0,
    extended_count INTEGER DEFAULT 0,
    blocking_mode TEXT DEFAULT 'moderate' CHECK (blocking_mode IN ('strict', 'moderate', 'light')),
    soundscape_id UUID,
    soundscape_preset_id UUID,
    session_rating INTEGER CHECK (session_rating >= 1 AND session_rating <= 5),
    session_notes TEXT,
    focus_score INTEGER DEFAULT 0 CHECK (focus_score >= 0 AND focus_score <= 100),
    flow_state_detected BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
    room_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Session Analytics Table

```sql
CREATE TABLE public.session_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL UNIQUE REFERENCES public.focus_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    distractions_blocked INTEGER DEFAULT 0,
    distractions_allowed INTEGER DEFAULT 0,
    apps_blocked JSONB DEFAULT '[]'::jsonb,
    sites_blocked JSONB DEFAULT '[]'::jsonb,
    pause_count INTEGER DEFAULT 0,
    longest_uninterrupted_minutes NUMERIC(6, 2) DEFAULT 0,
    focus_score_breakdown JSONB DEFAULT '{}'::jsonb,
    completion_rate NUMERIC(5, 2) DEFAULT 0,
    heart_rate_avg INTEGER,
    hrv_avg NUMERIC(6, 2),
    biometric_flow_detected BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Soundscapes Table (Global Reference)

```sql
CREATE TABLE public.soundscapes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('nature', 'urban', 'music', 'noise', 'custom')),
    description TEXT DEFAULT '',
    icon_name TEXT,
    layers JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_premium BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.soundscape_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Custom Mix',
    base_soundscape_id UUID REFERENCES public.soundscapes(id) ON DELETE SET NULL,
    layer_volumes JSONB NOT NULL DEFAULT '{}'::jsonb,
    master_volume NUMERIC(3, 2) DEFAULT 0.70,
    task_category_default TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Blocking Rules Table

```sql
CREATE TABLE public.blocking_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    app_or_site TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('app', 'website')),
    blocking_behavior TEXT NOT NULL DEFAULT 'context_dependent' CHECK (blocking_behavior IN ('always_block', 'context_dependent', 'always_allow')),
    context_rules JSONB DEFAULT '{}'::jsonb,
    override_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, app_or_site, rule_type)
);
```

### App Usage Table (Distraction Log)

```sql
CREATE TABLE public.app_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.focus_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    app_or_site TEXT NOT NULL,
    usage_type TEXT NOT NULL CHECK (usage_type IN ('blocked', 'allowed', 'emergency_bypass')),
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    duration_seconds INTEGER DEFAULT 0,
    was_override BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Streaks Table

```sql
CREATE TABLE public.streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_active_date DATE,
    streak_freezes_available INTEGER DEFAULT 0,
    streak_freezes_used_this_week INTEGER DEFAULT 0,
    skill_level TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'apprentice', 'focused', 'deep_worker', 'flow_master')),
    total_focus_hours NUMERIC(10, 2) DEFAULT 0,
    total_sessions_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Goals Table

```sql
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('daily_minutes', 'daily_sessions', 'weekly_hours', 'weekly_sessions', 'streak_days')),
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'missed', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Teams Table

```sql
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE,
    max_members INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (team_id, user_id)
);
```

### Co-Focus Rooms Table

```sql
CREATE TABLE public.co_focus_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Focus Room',
    host_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    soundscape_id UUID REFERENCES public.soundscapes(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT false,
    max_participants INTEGER DEFAULT 10,
    current_participant_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    total_focus_hours NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.co_focus_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'focusing' CHECK (status IN ('focusing', 'on_break', 'idle')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    left_at TIMESTAMPTZ,
    UNIQUE (room_id, user_id)
);
```

### Subscriptions Table

```sql
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'focus', 'pro')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON public.users(email);

-- Focus Sessions
CREATE INDEX idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_started_at ON public.focus_sessions(started_at DESC);
CREATE INDEX idx_focus_sessions_status ON public.focus_sessions(status);
CREATE INDEX idx_focus_sessions_task_category ON public.focus_sessions(task_category);
CREATE INDEX idx_focus_sessions_room_id ON public.focus_sessions(room_id);
CREATE INDEX idx_focus_sessions_user_date ON public.focus_sessions(user_id, started_at DESC);

-- Session Analytics
CREATE INDEX idx_session_analytics_session_id ON public.session_analytics(session_id);
CREATE INDEX idx_session_analytics_user_id ON public.session_analytics(user_id);

-- Soundscapes
CREATE INDEX idx_soundscapes_category ON public.soundscapes(category);
CREATE INDEX idx_soundscapes_sort ON public.soundscapes(sort_order);

-- Soundscape Presets
CREATE INDEX idx_soundscape_presets_user_id ON public.soundscape_presets(user_id);

-- Blocking Rules
CREATE INDEX idx_blocking_rules_user_id ON public.blocking_rules(user_id);
CREATE INDEX idx_blocking_rules_behavior ON public.blocking_rules(user_id, blocking_behavior);

-- App Usage
CREATE INDEX idx_app_usage_session_id ON public.app_usage(session_id);
CREATE INDEX idx_app_usage_user_id ON public.app_usage(user_id);
CREATE INDEX idx_app_usage_attempted_at ON public.app_usage(attempted_at DESC);

-- Streaks
CREATE INDEX idx_streaks_user_id ON public.streaks(user_id);

-- Goals
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_status ON public.goals(status);
CREATE INDEX idx_goals_period ON public.goals(user_id, period_start, period_end);

-- Teams
CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX idx_teams_invite_code ON public.teams(invite_code);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

-- Co-Focus Rooms
CREATE INDEX idx_co_focus_rooms_host_id ON public.co_focus_rooms(host_id);
CREATE INDEX idx_co_focus_rooms_team_id ON public.co_focus_rooms(team_id);
CREATE INDEX idx_co_focus_rooms_status ON public.co_focus_rooms(status);
CREATE INDEX idx_room_participants_room_id ON public.room_participants(room_id);
CREATE INDEX idx_room_participants_user_id ON public.room_participants(user_id);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- Composite index for analytics queries (focus heatmap)
CREATE INDEX idx_focus_sessions_heatmap ON public.focus_sessions(user_id, task_category, focus_score, started_at);
```

---

## Row Level Security Policies

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soundscapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soundscape_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocking_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.co_focus_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Focus Sessions
CREATE POLICY "Users can CRUD own sessions" ON public.focus_sessions FOR ALL USING (auth.uid() = user_id);

-- Session Analytics
CREATE POLICY "Users can CRUD own analytics" ON public.session_analytics FOR ALL USING (auth.uid() = user_id);

-- Soundscapes: globally readable
CREATE POLICY "Soundscapes are publicly readable" ON public.soundscapes FOR SELECT USING (true);

-- Soundscape Presets
CREATE POLICY "Users can CRUD own presets" ON public.soundscape_presets FOR ALL USING (auth.uid() = user_id);

-- Blocking Rules
CREATE POLICY "Users can CRUD own blocking rules" ON public.blocking_rules FOR ALL USING (auth.uid() = user_id);

-- App Usage
CREATE POLICY "Users can CRUD own app usage" ON public.app_usage FOR ALL USING (auth.uid() = user_id);

-- Streaks
CREATE POLICY "Users can CRUD own streaks" ON public.streaks FOR ALL USING (auth.uid() = user_id);

-- Goals
CREATE POLICY "Users can CRUD own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);

-- Teams: members can read their teams
CREATE POLICY "Team members can read team" ON public.teams FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.team_members WHERE team_id = teams.id AND user_id = auth.uid()));
CREATE POLICY "Owners can update teams" ON public.teams FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can create teams" ON public.teams FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can delete teams" ON public.teams FOR DELETE USING (auth.uid() = owner_id);

-- Team Members
CREATE POLICY "Team members can read membership" ON public.team_members FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()));
CREATE POLICY "Users can join teams" ON public.team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave teams" ON public.team_members FOR DELETE USING (auth.uid() = user_id);

-- Co-Focus Rooms
CREATE POLICY "Active rooms are readable" ON public.co_focus_rooms FOR SELECT USING (is_public = true OR auth.uid() = host_id OR EXISTS (SELECT 1 FROM public.room_participants WHERE room_id = co_focus_rooms.id AND user_id = auth.uid()));
CREATE POLICY "Users can create rooms" ON public.co_focus_rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update rooms" ON public.co_focus_rooms FOR UPDATE USING (auth.uid() = host_id);

-- Room Participants
CREATE POLICY "Room participants are readable by participants" ON public.room_participants FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.room_participants rp WHERE rp.room_id = room_participants.room_id AND rp.user_id = auth.uid()));
CREATE POLICY "Users can join rooms" ON public.room_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.room_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own participation" ON public.room_participants FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can read own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
```

---

## Database Functions & Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.focus_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.soundscape_presets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.blocking_rules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.streaks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.co_focus_rooms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create user profile and streak on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));

    INSERT INTO public.streaks (user_id) VALUES (NEW.id);

    INSERT INTO public.subscriptions (user_id, plan, status)
    VALUES (NEW.id, 'free', 'active');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update streak when a session is completed
CREATE OR REPLACE FUNCTION public.update_streak_on_session_complete()
RETURNS TRIGGER AS $$
DECLARE
    last_date DATE;
    current_date_val DATE;
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        current_date_val := (NEW.ended_at AT TIME ZONE 'UTC')::DATE;

        SELECT last_active_date INTO last_date
        FROM public.streaks WHERE user_id = NEW.user_id;

        IF last_date IS NULL OR last_date < current_date_val - INTERVAL '1 day' THEN
            UPDATE public.streaks SET
                current_streak_days = 1,
                last_active_date = current_date_val,
                total_sessions_completed = total_sessions_completed + 1,
                total_focus_hours = total_focus_hours + (NEW.actual_duration_minutes / 60.0)
            WHERE user_id = NEW.user_id;
        ELSIF last_date = current_date_val - INTERVAL '1 day' THEN
            UPDATE public.streaks SET
                current_streak_days = current_streak_days + 1,
                longest_streak_days = GREATEST(longest_streak_days, current_streak_days + 1),
                last_active_date = current_date_val,
                total_sessions_completed = total_sessions_completed + 1,
                total_focus_hours = total_focus_hours + (NEW.actual_duration_minutes / 60.0)
            WHERE user_id = NEW.user_id;
        ELSE
            UPDATE public.streaks SET
                total_sessions_completed = total_sessions_completed + 1,
                total_focus_hours = total_focus_hours + (NEW.actual_duration_minutes / 60.0)
            WHERE user_id = NEW.user_id;
        END IF;

        -- Update skill level based on total hours
        UPDATE public.streaks SET skill_level = CASE
            WHEN total_focus_hours >= 500 THEN 'flow_master'
            WHEN total_focus_hours >= 200 THEN 'deep_worker'
            WHEN total_focus_hours >= 50 THEN 'focused'
            WHEN total_focus_hours >= 10 THEN 'apprentice'
            ELSE 'beginner'
        END WHERE user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_session_complete
    AFTER UPDATE ON public.focus_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_streak_on_session_complete();

-- Calculate focus score for a session
CREATE OR REPLACE FUNCTION public.calculate_focus_score(
    p_planned_minutes INTEGER,
    p_actual_minutes INTEGER,
    p_distractions_blocked INTEGER,
    p_distractions_allowed INTEGER,
    p_pause_count INTEGER,
    p_session_rating INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    completion_score NUMERIC;
    distraction_score NUMERIC;
    continuity_score NUMERIC;
    rating_bonus NUMERIC;
    total_score NUMERIC;
BEGIN
    -- Completion rate (40% weight)
    completion_score := LEAST(p_actual_minutes::NUMERIC / GREATEST(p_planned_minutes, 1), 1.0) * 40;

    -- Distraction resistance (30% weight)
    IF (p_distractions_blocked + p_distractions_allowed) = 0 THEN
        distraction_score := 30;
    ELSE
        distraction_score := (p_distractions_blocked::NUMERIC / (p_distractions_blocked + p_distractions_allowed)) * 30;
    END IF;

    -- Continuity (20% weight) -- fewer pauses is better
    continuity_score := GREATEST(20 - (p_pause_count * 5), 0);

    -- Self-rating bonus (10% weight)
    rating_bonus := COALESCE(p_session_rating, 3) * 2;

    total_score := completion_score + distraction_score + continuity_score + rating_bonus;
    RETURN LEAST(ROUND(total_score), 100)::INTEGER;
END;
$$ LANGUAGE plpgsql;
```

---

## TypeScript Interfaces

```typescript
interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  work_type: 'developer' | 'writer' | 'designer' | 'researcher' | 'student' | 'other';
  peak_focus_time: 'early_morning' | 'late_morning' | 'afternoon' | 'evening' | 'night';
  typical_focus_duration: number;
  biggest_distraction: string;
  day_start_hour: number;
  timezone: string;
  onboarding_completed: boolean;
  notification_daily_report: boolean;
  notification_weekly_report: boolean;
  keep_data_local_only: boolean;
  data_retention_days: number;
  created_at: string;
  updated_at: string;
}

interface FocusSession {
  id: string;
  user_id: string;
  task_name: string;
  task_category: 'coding' | 'writing' | 'design' | 'research' | 'admin' | 'study' | 'other';
  planned_duration_minutes: number;
  actual_duration_minutes: number;
  started_at: string;
  ended_at: string | null;
  paused_duration_seconds: number;
  extended_count: number;
  blocking_mode: 'strict' | 'moderate' | 'light';
  soundscape_id: string | null;
  soundscape_preset_id: string | null;
  session_rating: number | null;
  session_notes: string | null;
  focus_score: number;
  flow_state_detected: boolean;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  room_id: string | null;
  created_at: string;
  updated_at: string;
}

interface SessionAnalytics {
  id: string;
  session_id: string;
  user_id: string;
  distractions_blocked: number;
  distractions_allowed: number;
  apps_blocked: string[];
  sites_blocked: string[];
  pause_count: number;
  longest_uninterrupted_minutes: number;
  focus_score_breakdown: Record<string, number>;
  completion_rate: number;
  heart_rate_avg: number | null;
  hrv_avg: number | null;
  biometric_flow_detected: boolean;
  created_at: string;
}

interface Soundscape {
  id: string;
  name: string;
  display_name: string;
  category: 'nature' | 'urban' | 'music' | 'noise' | 'custom';
  description: string;
  icon_name: string | null;
  layers: { name: string; file_url: string; default_volume: number }[];
  is_premium: boolean;
  sort_order: number;
  created_at: string;
}

interface BlockingRule {
  id: string;
  user_id: string;
  app_or_site: string;
  rule_type: 'app' | 'website';
  blocking_behavior: 'always_block' | 'context_dependent' | 'always_allow';
  context_rules: Record<string, unknown>;
  override_count: number;
  created_at: string;
  updated_at: string;
}

interface Streak {
  id: string;
  user_id: string;
  current_streak_days: number;
  longest_streak_days: number;
  last_active_date: string | null;
  streak_freezes_available: number;
  streak_freezes_used_this_week: number;
  skill_level: 'beginner' | 'apprentice' | 'focused' | 'deep_worker' | 'flow_master';
  total_focus_hours: number;
  total_sessions_completed: number;
  created_at: string;
  updated_at: string;
}

interface Goal {
  id: string;
  user_id: string;
  goal_type: 'daily_minutes' | 'daily_sessions' | 'weekly_hours' | 'weekly_sessions' | 'streak_days';
  target_value: number;
  current_value: number;
  period_start: string;
  period_end: string;
  status: 'active' | 'completed' | 'missed' | 'archived';
  created_at: string;
  updated_at: string;
}

interface CoFocusRoom {
  id: string;
  name: string;
  host_id: string;
  team_id: string | null;
  soundscape_id: string | null;
  is_public: boolean;
  max_participants: number;
  current_participant_count: number;
  status: 'active' | 'closed';
  total_focus_hours: number;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'focus' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## Seed Data

```sql
-- Default soundscapes
INSERT INTO public.soundscapes (id, name, display_name, category, description, icon_name, layers, is_premium, sort_order) VALUES
    (gen_random_uuid(), 'rain', 'Rain on Window', 'nature', 'Gentle rain against a window pane', 'cloud-rain', '[{"name": "Main Rain", "file_url": "/sounds/rain-main.ogg", "default_volume": 0.7}, {"name": "Thunder", "file_url": "/sounds/rain-thunder.ogg", "default_volume": 0.3}, {"name": "Gutter Drip", "file_url": "/sounds/rain-gutter.ogg", "default_volume": 0.2}, {"name": "Wind", "file_url": "/sounds/rain-wind.ogg", "default_volume": 0.4}]', false, 1),
    (gen_random_uuid(), 'coffee_shop', 'Coffee Shop', 'urban', 'Busy cafe ambience with espresso machines', 'coffee', '[{"name": "Crowd Murmur", "file_url": "/sounds/cafe-crowd.ogg", "default_volume": 0.5}, {"name": "Espresso Machine", "file_url": "/sounds/cafe-espresso.ogg", "default_volume": 0.3}, {"name": "Cup Clinks", "file_url": "/sounds/cafe-cups.ogg", "default_volume": 0.2}, {"name": "Background Music", "file_url": "/sounds/cafe-music.ogg", "default_volume": 0.1}]', false, 2),
    (gen_random_uuid(), 'lofi', 'Lo-fi Beats', 'music', 'Relaxing lo-fi hip-hop beats for studying', 'headphones', '[{"name": "Beat", "file_url": "/sounds/lofi-beat.ogg", "default_volume": 0.6}, {"name": "Vinyl Crackle", "file_url": "/sounds/lofi-vinyl.ogg", "default_volume": 0.3}]', false, 3),
    (gen_random_uuid(), 'white_noise', 'White Noise', 'noise', 'Consistent white noise for blocking distractions', 'radio', '[{"name": "White Noise", "file_url": "/sounds/white-noise.ogg", "default_volume": 0.5}]', false, 4),
    (gen_random_uuid(), 'pink_noise', 'Pink Noise', 'noise', 'Softer pink noise for concentration', 'radio', '[{"name": "Pink Noise", "file_url": "/sounds/pink-noise.ogg", "default_volume": 0.5}]', false, 5),
    (gen_random_uuid(), 'brown_noise', 'Brown Noise', 'noise', 'Deep brown noise for deep focus', 'radio', '[{"name": "Brown Noise", "file_url": "/sounds/brown-noise.ogg", "default_volume": 0.5}]', false, 6),
    (gen_random_uuid(), 'forest', 'Forest', 'nature', 'Birds singing in a peaceful forest', 'trees', '[{"name": "Birds", "file_url": "/sounds/forest-birds.ogg", "default_volume": 0.5}, {"name": "Wind Through Leaves", "file_url": "/sounds/forest-wind.ogg", "default_volume": 0.4}, {"name": "Stream", "file_url": "/sounds/forest-stream.ogg", "default_volume": 0.3}]', false, 7),
    (gen_random_uuid(), 'ocean', 'Ocean Waves', 'nature', 'Rhythmic ocean waves on a beach', 'waves', '[{"name": "Waves", "file_url": "/sounds/ocean-waves.ogg", "default_volume": 0.7}, {"name": "Seagulls", "file_url": "/sounds/ocean-seagulls.ogg", "default_volume": 0.1}]', false, 8);

-- Default blocking rules for common distracting apps
-- These are inserted per-user during onboarding based on quiz answers
```

---

## Local SQLite Cache Notes

```
-- Tables mirrored locally for offline session tracking:
-- focus_sessions (all sessions, write-ahead log for sync)
-- session_analytics (all analytics for user)
-- blocking_rules (all user rules, needed for offline blocking)
-- streaks (current streak data)
-- goals (active goals)
-- soundscapes (full reference, for offline audio playback)
-- soundscape_presets (user custom mixes)
--
-- Offline behavior:
-- 1. Timer and blocking work fully offline (core functionality)
-- 2. Sessions recorded to SQLite immediately
-- 3. Analytics computed locally and synced when online
-- 4. Soundscape audio files cached locally (100MB budget)
-- 5. Co-focus rooms require internet connection
--
-- Sync strategy:
-- 1. On app launch: pull latest streak/goals from Supabase
-- 2. During sessions: write locally, queue for cloud sync
-- 3. On reconnect: push all queued sessions, pull team data
-- 4. Conflict resolution: merge by timestamp, server wins for streaks
```

---

## Migration Strategy

### File Naming Convention

```
migrations/
  001_initial_schema.sql          -- Users, extensions
  002_focus_sessions.sql          -- Focus sessions, session analytics
  003_soundscapes.sql             -- Soundscapes, soundscape presets
  004_blocking_rules.sql          -- Blocking rules, app usage
  005_streaks_goals.sql           -- Streaks, goals
  006_teams_rooms.sql             -- Teams, team members, co-focus rooms, participants
  007_subscriptions.sql           -- Subscriptions
  008_indexes.sql                 -- All indexes
  009_rls_policies.sql            -- Row level security
  010_functions_triggers.sql      -- Functions and triggers
  011_seed_soundscapes.sql        -- Default soundscape data
```

### Execution Order

1. Run migrations sequentially (001 through 011)
2. RLS policies applied after all tables and join tables exist
3. Triggers applied after functions are created
4. Soundscape seed data inserted last
5. Per-user blocking rules seeded during onboarding flow
6. Local SQLite schema generated from TypeScript interfaces

---

*Schema designed for an AI-powered focus environment that treats deep work as a trainable skill.*
