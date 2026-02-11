# Luminary -- Database Schema

> Complete database schema for the AI music production companion. Supabase (PostgreSQL) for cloud sync, with local SQLite cache notes for offline editing.

---

## Entity Relationship Summary

```
users
  |-- 1:N -- projects
  |-- 1:N -- subscriptions
  |-- 1:N -- generation_history
  |
  projects
    |-- 1:N -- sessions
    |-- 1:N -- chord_progressions
    |-- 1:N -- melodies
    |-- 1:N -- mix_analyses
    |-- 1:N -- samples (project_samples join)
    |-- 1:N -- presets
  |
  sessions
    |-- 1:N -- generation_history
  |
  chord_progressions
    |-- 1:N -- melodies (optional FK)
```

**Key relationships:**
- A **user** owns multiple **projects**, each containing musical data (chords, melodies, mixes)
- **Sessions** track individual work periods within a project
- **Generation history** logs every AI generation for billing and learning
- **Subscriptions** track plan tiers (Free, Creator, Pro)
- **Presets** store saved audio/mix settings per project
- **Samples** are globally available but linked to projects via a join table

---

## Complete SQL DDL

### Users Table

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    daw_preference TEXT DEFAULT 'ableton',
    genre_preferences JSONB DEFAULT '[]'::jsonb,
    experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', '1-3_years', '3-5_years', '5+_years')),
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    ai_suggestion_frequency TEXT DEFAULT 'moderate' CHECK (ai_suggestion_frequency IN ('conservative', 'moderate', 'aggressive')),
    explanation_depth TEXT DEFAULT 'detailed' CHECK (explanation_depth IN ('brief', 'detailed')),
    ui_scale INTEGER DEFAULT 100 CHECK (ui_scale >= 80 AND ui_scale <= 150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Projects Table

```sql
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Untitled Project',
    description TEXT DEFAULT '',
    key_signature TEXT DEFAULT 'C',
    scale_type TEXT DEFAULT 'major',
    bpm NUMERIC(6, 2) DEFAULT 120.00,
    time_signature TEXT DEFAULT '4/4',
    genre TEXT DEFAULT 'pop',
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
    arrangement_data JSONB DEFAULT '{}'::jsonb,
    energy_curve JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Sessions Table

```sql
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0,
    actions_count INTEGER DEFAULT 0,
    midi_exports_count INTEGER DEFAULT 0,
    suggestions_accepted INTEGER DEFAULT 0,
    suggestions_rejected INTEGER DEFAULT 0,
    daw_connected BOOLEAN DEFAULT false,
    daw_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Chord Progressions Table

```sql
CREATE TABLE public.chord_progressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Untitled Progression',
    key_signature TEXT NOT NULL DEFAULT 'C',
    scale_type TEXT NOT NULL DEFAULT 'major',
    chords JSONB NOT NULL DEFAULT '[]'::jsonb,
    roman_numerals JSONB DEFAULT '[]'::jsonb,
    voicings JSONB DEFAULT '[]'::jsonb,
    mood TEXT,
    genre_template TEXT,
    is_ai_generated BOOLEAN DEFAULT false,
    ai_explanation TEXT,
    midi_data BYTEA,
    duration_bars INTEGER DEFAULT 4,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Melodies Table

```sql
CREATE TABLE public.melodies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    chord_progression_id UUID REFERENCES public.chord_progressions(id) ON DELETE SET NULL,
    name TEXT DEFAULT 'Untitled Melody',
    notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    density TEXT DEFAULT 'medium' CHECK (density IN ('sparse', 'medium', 'dense')),
    octave_range INTEGER DEFAULT 2,
    complexity TEXT DEFAULT 'medium' CHECK (complexity IN ('simple', 'medium', 'complex')),
    contour TEXT DEFAULT 'wave' CHECK (contour IN ('ascending', 'descending', 'wave', 'random')),
    style TEXT DEFAULT 'legato' CHECK (style IN ('legato', 'staccato', 'syncopated', 'arpeggiated')),
    is_ai_generated BOOLEAN DEFAULT false,
    variation_of UUID REFERENCES public.melodies(id) ON DELETE SET NULL,
    midi_data BYTEA,
    duration_bars INTEGER DEFAULT 4,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Mix Analyses Table

```sql
CREATE TABLE public.mix_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL DEFAULT 'full_mix' CHECK (analysis_type IN ('full_mix', 'stem', 'mastering')),
    audio_file_url TEXT,
    audio_file_name TEXT,
    frequency_data JSONB DEFAULT '{}'::jsonb,
    stereo_width NUMERIC(5, 2),
    lufs_integrated NUMERIC(6, 2),
    lufs_short_term NUMERIC(6, 2),
    peak_db NUMERIC(6, 2),
    rms_db NUMERIC(6, 2),
    dynamic_range NUMERIC(5, 2),
    mix_score NUMERIC(4, 2) CHECK (mix_score >= 0 AND mix_score <= 10),
    issues JSONB DEFAULT '[]'::jsonb,
    suggestions JSONB DEFAULT '[]'::jsonb,
    reference_track_url TEXT,
    genre_target TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Samples Table

```sql
CREATE TABLE public.samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    duration_seconds NUMERIC(8, 2),
    key_signature TEXT,
    bpm NUMERIC(6, 2),
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('drums', 'melodic', 'fx', 'vocal', 'ambient', 'other')),
    subcategory TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    waveform_data JSONB,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.project_samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    sample_id UUID NOT NULL REFERENCES public.samples(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_favorite BOOLEAN DEFAULT false,
    UNIQUE (project_id, sample_id)
);
```

### Presets Table

```sql
CREATE TABLE public.presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Untitled Preset',
    preset_type TEXT NOT NULL CHECK (preset_type IN ('chord_mood', 'melody_params', 'mix_settings', 'export_settings', 'soundscape', 'genre_template')),
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_global BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Subscriptions Table

```sql
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'creator', 'pro')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    suggestions_used_this_month INTEGER DEFAULT 0,
    suggestions_limit INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Generation History Table

```sql
CREATE TABLE public.generation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    generation_type TEXT NOT NULL CHECK (generation_type IN ('chord_progression', 'melody', 'mix_analysis', 'arrangement', 'mastering', 'key_detection', 'bpm_detection', 'sample_recommendation', 'chat_response')),
    input_params JSONB DEFAULT '{}'::jsonb,
    output_data JSONB DEFAULT '{}'::jsonb,
    model_used TEXT,
    processing_time_ms INTEGER,
    was_accepted BOOLEAN,
    feedback TEXT,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON public.users(email);

-- Projects
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_genre ON public.projects(genre);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);

-- Sessions
CREATE INDEX idx_sessions_project_id ON public.sessions(project_id);
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_started_at ON public.sessions(started_at DESC);

-- Chord Progressions
CREATE INDEX idx_chord_progressions_project_id ON public.chord_progressions(project_id);
CREATE INDEX idx_chord_progressions_user_id ON public.chord_progressions(user_id);
CREATE INDEX idx_chord_progressions_mood ON public.chord_progressions(mood);
CREATE INDEX idx_chord_progressions_key ON public.chord_progressions(key_signature, scale_type);

-- Melodies
CREATE INDEX idx_melodies_project_id ON public.melodies(project_id);
CREATE INDEX idx_melodies_user_id ON public.melodies(user_id);
CREATE INDEX idx_melodies_chord_progression_id ON public.melodies(chord_progression_id);

-- Mix Analyses
CREATE INDEX idx_mix_analyses_project_id ON public.mix_analyses(project_id);
CREATE INDEX idx_mix_analyses_user_id ON public.mix_analyses(user_id);
CREATE INDEX idx_mix_analyses_type ON public.mix_analyses(analysis_type);

-- Samples
CREATE INDEX idx_samples_category ON public.samples(category);
CREATE INDEX idx_samples_key ON public.samples(key_signature);
CREATE INDEX idx_samples_bpm ON public.samples(bpm);
CREATE INDEX idx_samples_name_trgm ON public.samples USING gin (name gin_trgm_ops);

-- Project Samples
CREATE INDEX idx_project_samples_project_id ON public.project_samples(project_id);
CREATE INDEX idx_project_samples_sample_id ON public.project_samples(sample_id);
CREATE INDEX idx_project_samples_user_id ON public.project_samples(user_id);

-- Presets
CREATE INDEX idx_presets_user_id ON public.presets(user_id);
CREATE INDEX idx_presets_project_id ON public.presets(project_id);
CREATE INDEX idx_presets_type ON public.presets(preset_type);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Generation History
CREATE INDEX idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX idx_generation_history_project_id ON public.generation_history(project_id);
CREATE INDEX idx_generation_history_session_id ON public.generation_history(session_id);
CREATE INDEX idx_generation_history_type ON public.generation_history(generation_type);
CREATE INDEX idx_generation_history_created_at ON public.generation_history(created_at DESC);

-- Enable trigram extension for sample search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

## Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chord_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.melodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mix_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

-- Users: users can only read/update their own profile
CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Projects: user owns their projects
CREATE POLICY "Users can CRUD own projects"
    ON public.projects FOR ALL
    USING (auth.uid() = user_id);

-- Sessions
CREATE POLICY "Users can CRUD own sessions"
    ON public.sessions FOR ALL
    USING (auth.uid() = user_id);

-- Chord Progressions
CREATE POLICY "Users can CRUD own chord progressions"
    ON public.chord_progressions FOR ALL
    USING (auth.uid() = user_id);

-- Melodies
CREATE POLICY "Users can CRUD own melodies"
    ON public.melodies FOR ALL
    USING (auth.uid() = user_id);

-- Mix Analyses
CREATE POLICY "Users can CRUD own mix analyses"
    ON public.mix_analyses FOR ALL
    USING (auth.uid() = user_id);

-- Samples: publicly readable, admin-inserted
CREATE POLICY "Samples are publicly readable"
    ON public.samples FOR SELECT
    USING (true);

-- Project Samples
CREATE POLICY "Users can CRUD own project samples"
    ON public.project_samples FOR ALL
    USING (auth.uid() = user_id);

-- Presets
CREATE POLICY "Users can CRUD own presets"
    ON public.presets FOR ALL
    USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can read own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
    ON public.subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
    ON public.subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Generation History
CREATE POLICY "Users can read own generation history"
    ON public.generation_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generation history"
    ON public.generation_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);
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

-- Apply trigger to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.chord_progressions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.melodies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.mix_analyses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.presets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));

    INSERT INTO public.subscriptions (user_id, plan, status, suggestions_limit)
    VALUES (NEW.id, 'free', 'active', 5);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reset monthly suggestion counter
CREATE OR REPLACE FUNCTION public.reset_monthly_suggestions()
RETURNS void AS $$
BEGIN
    UPDATE public.subscriptions
    SET suggestions_used_this_month = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment suggestion usage
CREATE OR REPLACE FUNCTION public.increment_suggestion_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage INTEGER;
    usage_limit INTEGER;
BEGIN
    SELECT suggestions_used_this_month, suggestions_limit
    INTO current_usage, usage_limit
    FROM public.subscriptions
    WHERE user_id = p_user_id AND status = 'active'
    LIMIT 1;

    IF current_usage >= usage_limit AND usage_limit > 0 THEN
        RETURN false;
    END IF;

    UPDATE public.subscriptions
    SET suggestions_used_this_month = suggestions_used_this_month + 1
    WHERE user_id = p_user_id AND status = 'active';

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## TypeScript Interfaces

```typescript
interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  daw_preference: string;
  genre_preferences: string[];
  experience_level: 'beginner' | '1-3_years' | '3-5_years' | '5+_years';
  onboarding_completed: boolean;
  ai_suggestion_frequency: 'conservative' | 'moderate' | 'aggressive';
  explanation_depth: 'brief' | 'detailed';
  ui_scale: number;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  key_signature: string;
  scale_type: string;
  bpm: number;
  time_signature: string;
  genre: string;
  status: 'in_progress' | 'completed' | 'archived';
  arrangement_data: Record<string, unknown>;
  energy_curve: unknown[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface Session {
  id: string;
  project_id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  actions_count: number;
  midi_exports_count: number;
  suggestions_accepted: number;
  suggestions_rejected: number;
  daw_connected: boolean;
  daw_name: string | null;
  created_at: string;
  updated_at: string;
}

interface ChordProgression {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  key_signature: string;
  scale_type: string;
  chords: { name: string; quality: string; inversion: number }[];
  roman_numerals: string[];
  voicings: number[][];
  mood: string | null;
  genre_template: string | null;
  is_ai_generated: boolean;
  ai_explanation: string | null;
  midi_data: ArrayBuffer | null;
  duration_bars: number;
  created_at: string;
  updated_at: string;
}

interface Melody {
  id: string;
  project_id: string;
  user_id: string;
  chord_progression_id: string | null;
  name: string;
  notes: { pitch: number; start: number; duration: number; velocity: number }[];
  density: 'sparse' | 'medium' | 'dense';
  octave_range: number;
  complexity: 'simple' | 'medium' | 'complex';
  contour: 'ascending' | 'descending' | 'wave' | 'random';
  style: 'legato' | 'staccato' | 'syncopated' | 'arpeggiated';
  is_ai_generated: boolean;
  variation_of: string | null;
  midi_data: ArrayBuffer | null;
  duration_bars: number;
  created_at: string;
  updated_at: string;
}

interface MixAnalysis {
  id: string;
  project_id: string;
  user_id: string;
  analysis_type: 'full_mix' | 'stem' | 'mastering';
  audio_file_url: string | null;
  audio_file_name: string | null;
  frequency_data: Record<string, unknown>;
  stereo_width: number | null;
  lufs_integrated: number | null;
  lufs_short_term: number | null;
  peak_db: number | null;
  rms_db: number | null;
  dynamic_range: number | null;
  mix_score: number | null;
  issues: { type: string; severity: string; description: string; suggestion: string }[];
  suggestions: string[];
  reference_track_url: string | null;
  genre_target: string | null;
  created_at: string;
  updated_at: string;
}

interface Sample {
  id: string;
  name: string;
  file_url: string;
  file_size_bytes: number;
  duration_seconds: number | null;
  key_signature: string | null;
  bpm: number | null;
  category: 'drums' | 'melodic' | 'fx' | 'vocal' | 'ambient' | 'other';
  subcategory: string | null;
  tags: string[];
  waveform_data: unknown | null;
  is_premium: boolean;
  created_at: string;
}

interface Preset {
  id: string;
  project_id: string | null;
  user_id: string;
  name: string;
  preset_type: 'chord_mood' | 'melody_params' | 'mix_settings' | 'export_settings' | 'soundscape' | 'genre_template';
  settings: Record<string, unknown>;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'creator' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  suggestions_used_this_month: number;
  suggestions_limit: number;
  created_at: string;
  updated_at: string;
}

interface GenerationHistory {
  id: string;
  user_id: string;
  project_id: string | null;
  session_id: string | null;
  generation_type: 'chord_progression' | 'melody' | 'mix_analysis' | 'arrangement' | 'mastering' | 'key_detection' | 'bpm_detection' | 'sample_recommendation' | 'chat_response';
  input_params: Record<string, unknown>;
  output_data: Record<string, unknown>;
  model_used: string | null;
  processing_time_ms: number | null;
  was_accepted: boolean | null;
  feedback: string | null;
  tokens_used: number;
  created_at: string;
}
```

---

## Seed Data

```sql
-- Subscription plans reference data (stored in app config, seeds free tier)
-- Free plan: 5 suggestions/day, basic features
-- Creator plan ($9.99/mo): unlimited suggestions, MIDI export, mixing tips
-- Pro plan ($19.99/mo): all features, DAW integration, mastering, collaboration

-- Default genre templates
INSERT INTO public.samples (id, name, file_url, category, subcategory, tags, is_premium) VALUES
    (gen_random_uuid(), 'Lo-fi Kick Warm', '/samples/drums/lofi-kick-warm.wav', 'drums', 'kick', '["lo-fi", "warm", "hip-hop"]', false),
    (gen_random_uuid(), 'Trap Hi-Hat Closed', '/samples/drums/trap-hihat-closed.wav', 'drums', 'hihat', '["trap", "closed", "crisp"]', false),
    (gen_random_uuid(), 'Analog Snare Punchy', '/samples/drums/analog-snare-punchy.wav', 'drums', 'snare', '["analog", "punchy", "classic"]', false),
    (gen_random_uuid(), 'Ambient Pad Cm', '/samples/melodic/ambient-pad-cm.wav', 'melodic', 'pad', '["ambient", "Cm", "dreamy"]', false),
    (gen_random_uuid(), 'Guitar Loop Chill Am', '/samples/melodic/guitar-loop-chill-am.wav', 'melodic', 'guitar', '["chill", "Am", "acoustic"]', false),
    (gen_random_uuid(), 'Vinyl Crackle Texture', '/samples/fx/vinyl-crackle.wav', 'fx', 'texture', '["lo-fi", "vinyl", "atmosphere"]', false),
    (gen_random_uuid(), 'Sub 808 A', '/samples/drums/sub-808-a.wav', 'drums', 'bass', '["808", "sub", "trap"]', false),
    (gen_random_uuid(), 'Piano Chord Stab', '/samples/melodic/piano-chord-stab.wav', 'melodic', 'piano', '["piano", "stab", "pop"]', true),
    (gen_random_uuid(), 'Vocal Chop Ethereal', '/samples/vocal/vocal-chop-ethereal.wav', 'vocal', 'chop', '["vocal", "ethereal", "future-bass"]', true),
    (gen_random_uuid(), 'Rain Ambient Loop', '/samples/ambient/rain-ambient-loop.wav', 'ambient', 'nature', '["rain", "ambient", "loop"]', false);

-- Default presets for genre templates
INSERT INTO public.presets (id, user_id, name, preset_type, settings, is_global) VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Lo-fi Hip-Hop', 'genre_template', '{"bpm": 85, "key": "Am", "scale": "minor", "chords": ["Am7", "Dm7", "G7", "Cmaj7"], "instruments": ["piano", "vinyl", "drums"]}', true),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Future Bass', 'genre_template', '{"bpm": 150, "key": "F", "scale": "major", "chords": ["Fmaj7", "Am", "Dm", "Bb"], "instruments": ["supersaw", "pluck", "808"]}', true),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Indie Pop', 'genre_template', '{"bpm": 120, "key": "C", "scale": "major", "chords": ["C", "G", "Am", "F"], "instruments": ["guitar", "piano", "drums"]}', true),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Techno', 'genre_template', '{"bpm": 130, "key": "Am", "scale": "minor", "chords": ["Am", "Em", "F", "G"], "instruments": ["synth", "kick", "hihat"]}', true),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Ambient', 'genre_template', '{"bpm": 70, "key": "D", "scale": "dorian", "chords": ["Dm9", "Am7", "Gmaj7", "Em7"], "instruments": ["pad", "reverb", "texture"]}', true);
```

---

## Local SQLite Cache Notes

For offline functionality, the Electron desktop app maintains a local SQLite database:

```
-- Tables mirrored locally for offline access:
-- projects (full copy for current user)
-- chord_progressions (full copy for open project)
-- melodies (full copy for open project)
-- presets (user presets + global presets)
-- generation_history (last 100 entries, write-ahead for sync)
--
-- Sync strategy:
-- 1. On app launch: pull latest from Supabase, merge with local
-- 2. During editing: write to local SQLite first, queue for Supabase sync
-- 3. On reconnect: push queued changes, pull remote changes, resolve conflicts via last-write-wins with timestamp comparison
-- 4. MIDI/audio files cached in app data directory with LRU eviction at 2GB
```

---

## Migration Strategy

### File Naming Convention

```
migrations/
  001_initial_schema.sql          -- Users, projects, sessions
  002_music_tables.sql            -- Chord progressions, melodies
  003_analysis_tables.sql         -- Mix analyses, samples
  004_subscription_billing.sql    -- Subscriptions, generation history
  005_presets_and_templates.sql   -- Presets, project_samples join
  006_indexes.sql                 -- All indexes
  007_rls_policies.sql            -- Row level security
  008_functions_triggers.sql      -- Functions and triggers
  009_seed_data.sql               -- Default samples, presets, templates
```

### Execution Order

1. Run migrations sequentially (001 through 009)
2. Enable required extensions (`pg_trgm`) before index creation
3. RLS policies applied after all tables exist
4. Triggers applied after functions are created
5. Seed data inserted last after all constraints are in place
6. Local SQLite schema generated from Supabase schema via code generation

---

*Schema designed for a music production companion that helps producers finish tracks faster.*
