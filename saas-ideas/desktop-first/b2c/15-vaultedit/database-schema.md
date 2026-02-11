# VaultEdit -- Database Schema

> Complete database schema for the AI video editor for YouTube creators. Supabase (PostgreSQL) for cloud sync and collaboration, with local SQLite cache for offline editing and project state.

---

## Entity Relationship Summary

```
users
  |-- 1:N -- projects
  |-- 1:N -- templates (user-created)
  |-- 1:N -- subscriptions
  |
  projects
    |-- 1:N -- media_files
    |-- 1:N -- transcripts
    |-- 1:N -- edits (edit decision list)
    |-- 1:N -- captions
    |-- 1:N -- thumbnails
    |-- 1:N -- exports
  |
  transcripts
    |-- 1:N -- edits
    |-- 1:N -- captions
  |
  templates (global + user-created)
```

**Key relationships:**
- A **user** creates multiple **projects**, each tied to one or more **media files**
- **Transcripts** are generated from media files via Whisper API and drive the editing workflow
- **Edits** form an Edit Decision List (EDL) -- non-destructive cuts, zooms, and effects
- **Captions** are derived from transcripts with styling and timing data
- **Thumbnails** store multiple variants per project for A/B testing
- **Exports** track render history with platform-specific settings
- **Templates** provide reusable caption styles, color presets, and transitions

---

## Complete SQL DDL

### Users Table

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    youtube_channel_id TEXT,
    youtube_channel_name TEXT,
    default_export_path TEXT DEFAULT '~/Desktop/exports/',
    default_export_format TEXT DEFAULT 'h264' CHECK (default_export_format IN ('h264', 'h265', 'vp9', 'av1')),
    auto_save_interval_seconds INTEGER DEFAULT 30,
    transcript_language TEXT DEFAULT 'en',
    filler_words JSONB DEFAULT '["um", "uh", "like", "you know", "basically", "actually", "so"]'::jsonb,
    silence_threshold_db INTEGER DEFAULT -40,
    silence_min_duration_ms INTEGER DEFAULT 800,
    ai_command_history_enabled BOOLEAN DEFAULT true,
    gpu_acceleration_enabled BOOLEAN DEFAULT true,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
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
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'exported', 'published', 'archived')),
    total_duration_ms BIGINT DEFAULT 0,
    edited_duration_ms BIGINT DEFAULT 0,
    resolution_width INTEGER DEFAULT 1920,
    resolution_height INTEGER DEFAULT 1080,
    frame_rate NUMERIC(6, 3) DEFAULT 30.000,
    aspect_ratio TEXT DEFAULT '16:9',
    color_preset TEXT,
    color_settings JSONB DEFAULT '{}'::jsonb,
    arrangement JSONB DEFAULT '{"sections": []}'::jsonb,
    chapter_markers JSONB DEFAULT '[]'::jsonb,
    edit_state JSONB DEFAULT '{}'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    thumbnail_url TEXT,
    local_project_path TEXT,
    last_auto_save_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Media Files Table

```sql
CREATE TABLE public.media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    media_type TEXT NOT NULL CHECK (media_type IN ('video', 'audio', 'image')),
    mime_type TEXT,
    duration_ms BIGINT DEFAULT 0,
    width INTEGER,
    height INTEGER,
    frame_rate NUMERIC(6, 3),
    codec TEXT,
    audio_codec TEXT,
    audio_channels INTEGER DEFAULT 2,
    audio_sample_rate INTEGER DEFAULT 48000,
    bitrate_kbps INTEGER,
    has_audio BOOLEAN DEFAULT true,
    waveform_data JSONB,
    scene_boundaries JSONB DEFAULT '[]'::jsonb,
    silence_segments JSONB DEFAULT '[]'::jsonb,
    thumbnail_url TEXT,
    is_primary BOOLEAN DEFAULT false,
    track_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Transcripts Table

```sql
CREATE TABLE public.transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    media_file_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    language TEXT DEFAULT 'en',
    full_text TEXT DEFAULT '',
    words JSONB NOT NULL DEFAULT '[]'::jsonb,
    speakers JSONB DEFAULT '[]'::jsonb,
    filler_words_detected JSONB DEFAULT '[]'::jsonb,
    confidence_average NUMERIC(5, 2) DEFAULT 0,
    whisper_model TEXT DEFAULT 'large-v3',
    processing_time_ms INTEGER,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Edits Table (Edit Decision List)

```sql
CREATE TABLE public.edits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    transcript_id UUID REFERENCES public.transcripts(id) ON DELETE SET NULL,
    edit_type TEXT NOT NULL CHECK (edit_type IN ('cut', 'trim', 'silence_remove', 'filler_remove', 'speed_change', 'zoom', 'jump_cut', 'transition', 'audio_duck', 'volume_adjust', 'color_grade', 'effect', 'b_roll_insert', 'reorder')),
    source_start_ms BIGINT NOT NULL DEFAULT 0,
    source_end_ms BIGINT NOT NULL DEFAULT 0,
    output_start_ms BIGINT,
    output_end_ms BIGINT,
    parameters JSONB DEFAULT '{}'::jsonb,
    ai_command TEXT,
    ai_generated BOOLEAN DEFAULT false,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Captions Table

```sql
CREATE TABLE public.captions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    transcript_id UUID REFERENCES public.transcripts(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    caption_style TEXT DEFAULT 'youtube_standard',
    style_settings JSONB DEFAULT '{}'::jsonb,
    words JSONB NOT NULL DEFAULT '[]'::jsonb,
    language TEXT DEFAULT 'en',
    is_burned_in BOOLEAN DEFAULT false,
    font_family TEXT DEFAULT 'Inter',
    font_size INTEGER DEFAULT 36,
    font_color TEXT DEFAULT '#FFFFFF',
    background_color TEXT DEFAULT '#000000',
    background_opacity NUMERIC(3, 2) DEFAULT 0.50,
    position TEXT DEFAULT 'bottom_center' CHECK (position IN ('top_left', 'top_center', 'top_right', 'center', 'bottom_left', 'bottom_center', 'bottom_right')),
    outline_width INTEGER DEFAULT 2,
    outline_color TEXT DEFAULT '#000000',
    shadow_enabled BOOLEAN DEFAULT false,
    animation_type TEXT DEFAULT 'none' CHECK (animation_type IN ('none', 'fade_in', 'typewriter', 'word_highlight', 'karaoke')),
    highlight_color TEXT DEFAULT '#7C3AED',
    words_per_line INTEGER DEFAULT 0,
    platform_target TEXT DEFAULT 'youtube' CHECK (platform_target IN ('youtube', 'youtube_shorts', 'tiktok', 'instagram_reels', 'instagram_feed', 'twitter')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Thumbnails Table

```sql
CREATE TABLE public.thumbnails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    variant_label TEXT DEFAULT 'A',
    source_frame_ms BIGINT,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    image_url TEXT,
    local_path TEXT,
    width INTEGER DEFAULT 1920,
    height INTEGER DEFAULT 1080,
    layers JSONB DEFAULT '[]'::jsonb,
    text_overlays JSONB DEFAULT '[]'::jsonb,
    background_removed BOOLEAN DEFAULT false,
    is_uploaded_to_youtube BOOLEAN DEFAULT false,
    youtube_ctr NUMERIC(5, 2),
    ab_test_start_at TIMESTAMPTZ,
    ab_test_end_at TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'uploaded', 'testing', 'winner')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Templates Table

```sql
CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('caption_style', 'color_preset', 'transition', 'intro', 'outro', 'lower_third', 'thumbnail', 'sound_effect', 'music')),
    category TEXT DEFAULT 'general',
    description TEXT DEFAULT '',
    preview_url TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_system BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Exports Table

```sql
CREATE TABLE public.exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL DEFAULT 'youtube' CHECK (platform IN ('youtube', 'youtube_shorts', 'tiktok', 'instagram_reels', 'instagram_feed', 'twitter', 'custom')),
    resolution_width INTEGER NOT NULL DEFAULT 1920,
    resolution_height INTEGER NOT NULL DEFAULT 1080,
    codec TEXT NOT NULL DEFAULT 'h264',
    bitrate_kbps INTEGER,
    frame_rate NUMERIC(6, 3) DEFAULT 30.000,
    audio_codec TEXT DEFAULT 'aac',
    audio_bitrate_kbps INTEGER DEFAULT 320,
    loudness_lufs NUMERIC(6, 2) DEFAULT -14.00,
    include_captions_srt BOOLEAN DEFAULT true,
    include_captions_burned BOOLEAN DEFAULT false,
    include_chapters BOOLEAN DEFAULT true,
    include_thumbnail BOOLEAN DEFAULT true,
    output_file_path TEXT,
    output_file_url TEXT,
    file_size_bytes BIGINT,
    render_time_seconds INTEGER,
    render_speed_multiplier NUMERIC(5, 2),
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    current_step TEXT,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'rendering', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
    transcription_minutes_used INTEGER DEFAULT 0,
    transcription_minutes_limit INTEGER DEFAULT 60,
    ai_commands_used INTEGER DEFAULT 0,
    ai_commands_limit INTEGER DEFAULT 20,
    storage_used_bytes BIGINT DEFAULT 0,
    storage_limit_bytes BIGINT DEFAULT 5368709120,
    export_watermark BOOLEAN DEFAULT true,
    max_export_resolution INTEGER DEFAULT 1080,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### AI Command History Table

```sql
CREATE TABLE public.ai_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    command_text TEXT NOT NULL,
    ai_response TEXT,
    edit_plan JSONB DEFAULT '[]'::jsonb,
    edits_applied JSONB DEFAULT '[]'::jsonb,
    was_accepted BOOLEAN,
    was_modified BOOLEAN DEFAULT false,
    model_used TEXT DEFAULT 'gpt-4o',
    tokens_used INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_youtube_channel ON public.users(youtube_channel_id);

-- Projects
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX idx_projects_updated_at ON public.projects(updated_at DESC);
CREATE INDEX idx_projects_tags ON public.projects USING gin (tags);

-- Media Files
CREATE INDEX idx_media_files_project_id ON public.media_files(project_id);
CREATE INDEX idx_media_files_user_id ON public.media_files(user_id);
CREATE INDEX idx_media_files_type ON public.media_files(media_type);

-- Transcripts
CREATE INDEX idx_transcripts_project_id ON public.transcripts(project_id);
CREATE INDEX idx_transcripts_media_file_id ON public.transcripts(media_file_id);
CREATE INDEX idx_transcripts_user_id ON public.transcripts(user_id);
CREATE INDEX idx_transcripts_status ON public.transcripts(status);
-- Full-text search on transcript content
CREATE INDEX idx_transcripts_fulltext ON public.transcripts USING gin (to_tsvector('english', full_text));

-- Edits
CREATE INDEX idx_edits_project_id ON public.edits(project_id);
CREATE INDEX idx_edits_user_id ON public.edits(user_id);
CREATE INDEX idx_edits_transcript_id ON public.edits(transcript_id);
CREATE INDEX idx_edits_type ON public.edits(edit_type);
CREATE INDEX idx_edits_sequence ON public.edits(project_id, sequence_order);
CREATE INDEX idx_edits_active ON public.edits(project_id, is_active) WHERE is_active = true;

-- Captions
CREATE INDEX idx_captions_project_id ON public.captions(project_id);
CREATE INDEX idx_captions_transcript_id ON public.captions(transcript_id);
CREATE INDEX idx_captions_user_id ON public.captions(user_id);
CREATE INDEX idx_captions_platform ON public.captions(platform_target);

-- Thumbnails
CREATE INDEX idx_thumbnails_project_id ON public.thumbnails(project_id);
CREATE INDEX idx_thumbnails_user_id ON public.thumbnails(user_id);
CREATE INDEX idx_thumbnails_status ON public.thumbnails(status);

-- Templates
CREATE INDEX idx_templates_user_id ON public.templates(user_id);
CREATE INDEX idx_templates_type ON public.templates(template_type);
CREATE INDEX idx_templates_system ON public.templates(is_system) WHERE is_system = true;
CREATE INDEX idx_templates_popularity ON public.templates(popularity_score DESC);
CREATE INDEX idx_templates_name_trgm ON public.templates USING gin (name gin_trgm_ops);

-- Exports
CREATE INDEX idx_exports_project_id ON public.exports(project_id);
CREATE INDEX idx_exports_user_id ON public.exports(user_id);
CREATE INDEX idx_exports_status ON public.exports(status);
CREATE INDEX idx_exports_platform ON public.exports(platform);
CREATE INDEX idx_exports_created_at ON public.exports(created_at DESC);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- AI Commands
CREATE INDEX idx_ai_commands_project_id ON public.ai_commands(project_id);
CREATE INDEX idx_ai_commands_user_id ON public.ai_commands(user_id);
CREATE INDEX idx_ai_commands_created_at ON public.ai_commands(created_at DESC);

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

## Row Level Security Policies

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thumbnails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_commands ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects
CREATE POLICY "Users can CRUD own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);

-- Media Files
CREATE POLICY "Users can CRUD own media files" ON public.media_files FOR ALL USING (auth.uid() = user_id);

-- Transcripts
CREATE POLICY "Users can CRUD own transcripts" ON public.transcripts FOR ALL USING (auth.uid() = user_id);

-- Edits
CREATE POLICY "Users can CRUD own edits" ON public.edits FOR ALL USING (auth.uid() = user_id);

-- Captions
CREATE POLICY "Users can CRUD own captions" ON public.captions FOR ALL USING (auth.uid() = user_id);

-- Thumbnails
CREATE POLICY "Users can CRUD own thumbnails" ON public.thumbnails FOR ALL USING (auth.uid() = user_id);

-- Templates: system templates readable by all, user templates owner-only
CREATE POLICY "System templates are readable" ON public.templates FOR SELECT USING (is_system = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON public.templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.templates FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- Exports
CREATE POLICY "Users can CRUD own exports" ON public.exports FOR ALL USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can read own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- AI Commands
CREATE POLICY "Users can CRUD own AI commands" ON public.ai_commands FOR ALL USING (auth.uid() = user_id);
```

---

## Database Functions & Triggers

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.transcripts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.edits FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.captions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.thumbnails FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));

    INSERT INTO public.subscriptions (
        user_id, plan, status,
        transcription_minutes_limit, ai_commands_limit,
        storage_limit_bytes, export_watermark, max_export_resolution
    )
    VALUES (NEW.id, 'free', 'active', 60, 20, 5368709120, true, 1080);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update project duration when media files change
CREATE OR REPLACE FUNCTION public.update_project_duration()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.projects SET
        total_duration_ms = COALESCE((
            SELECT SUM(duration_ms) FROM public.media_files
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) AND media_type = 'video'
        ), 0)
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_duration_on_media_change
    AFTER INSERT OR UPDATE OR DELETE ON public.media_files
    FOR EACH ROW EXECUTE FUNCTION public.update_project_duration();

-- Track AI command usage against subscription limits
CREATE OR REPLACE FUNCTION public.check_ai_command_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    used INTEGER;
    max_limit INTEGER;
BEGIN
    SELECT ai_commands_used, ai_commands_limit
    INTO used, max_limit
    FROM public.subscriptions
    WHERE user_id = p_user_id AND status = 'active'
    LIMIT 1;

    IF max_limit = -1 THEN RETURN true; END IF;
    RETURN used < max_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment AI command usage
CREATE OR REPLACE FUNCTION public.increment_ai_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.subscriptions
    SET ai_commands_used = ai_commands_used + 1
    WHERE user_id = NEW.user_id AND status = 'active';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ai_command_created
    AFTER INSERT ON public.ai_commands
    FOR EACH ROW EXECUTE FUNCTION public.increment_ai_usage();

-- Check transcription minutes limit
CREATE OR REPLACE FUNCTION public.check_transcription_limit(p_user_id UUID, p_duration_minutes INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    used INTEGER;
    max_limit INTEGER;
BEGIN
    SELECT transcription_minutes_used, transcription_minutes_limit
    INTO used, max_limit
    FROM public.subscriptions
    WHERE user_id = p_user_id AND status = 'active'
    LIMIT 1;

    IF max_limit = -1 THEN RETURN true; END IF;
    RETURN (used + p_duration_minutes) <= max_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate edited duration from active edits
CREATE OR REPLACE FUNCTION public.calculate_edited_duration(p_project_id UUID)
RETURNS BIGINT AS $$
DECLARE
    total BIGINT;
BEGIN
    SELECT COALESCE(SUM(source_end_ms - source_start_ms), 0)
    INTO total
    FROM public.edits
    WHERE project_id = p_project_id AND is_active = true AND edit_type = 'cut';

    -- Edited duration = total duration minus cuts
    RETURN (SELECT total_duration_ms FROM public.projects WHERE id = p_project_id) - total;
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
  youtube_channel_id: string | null;
  youtube_channel_name: string | null;
  default_export_path: string;
  default_export_format: 'h264' | 'h265' | 'vp9' | 'av1';
  auto_save_interval_seconds: number;
  transcript_language: string;
  filler_words: string[];
  silence_threshold_db: number;
  silence_min_duration_ms: number;
  ai_command_history_enabled: boolean;
  gpu_acceleration_enabled: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: 'draft' | 'in_progress' | 'exported' | 'published' | 'archived';
  total_duration_ms: number;
  edited_duration_ms: number;
  resolution_width: number;
  resolution_height: number;
  frame_rate: number;
  aspect_ratio: string;
  color_preset: string | null;
  color_settings: Record<string, unknown>;
  arrangement: { sections: { name: string; start_ms: number; end_ms: number }[] };
  chapter_markers: { title: string; timestamp_ms: number }[];
  edit_state: Record<string, unknown>;
  tags: string[];
  thumbnail_url: string | null;
  local_project_path: string | null;
  created_at: string;
  updated_at: string;
}

interface MediaFile {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_url: string | null;
  file_size_bytes: number;
  media_type: 'video' | 'audio' | 'image';
  mime_type: string | null;
  duration_ms: number;
  width: number | null;
  height: number | null;
  frame_rate: number | null;
  codec: string | null;
  has_audio: boolean;
  waveform_data: unknown | null;
  scene_boundaries: number[];
  silence_segments: { start_ms: number; end_ms: number; duration_ms: number }[];
  is_primary: boolean;
  track_index: number;
  created_at: string;
}

interface Transcript {
  id: string;
  project_id: string;
  media_file_id: string;
  user_id: string;
  language: string;
  full_text: string;
  words: { word: string; start_ms: number; end_ms: number; confidence: number; speaker?: string }[];
  speakers: { id: string; label: string; color: string }[];
  filler_words_detected: { word: string; start_ms: number; end_ms: number; index: number }[];
  confidence_average: number;
  whisper_model: string;
  processing_time_ms: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface Edit {
  id: string;
  project_id: string;
  user_id: string;
  transcript_id: string | null;
  edit_type: 'cut' | 'trim' | 'silence_remove' | 'filler_remove' | 'speed_change' | 'zoom' | 'jump_cut' | 'transition' | 'audio_duck' | 'volume_adjust' | 'color_grade' | 'effect' | 'b_roll_insert' | 'reorder';
  source_start_ms: number;
  source_end_ms: number;
  output_start_ms: number | null;
  output_end_ms: number | null;
  parameters: Record<string, unknown>;
  ai_command: string | null;
  ai_generated: boolean;
  sequence_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Caption {
  id: string;
  project_id: string;
  transcript_id: string | null;
  user_id: string;
  caption_style: string;
  style_settings: Record<string, unknown>;
  words: { word: string; start_ms: number; end_ms: number }[];
  language: string;
  is_burned_in: boolean;
  font_family: string;
  font_size: number;
  font_color: string;
  background_color: string;
  background_opacity: number;
  position: string;
  animation_type: 'none' | 'fade_in' | 'typewriter' | 'word_highlight' | 'karaoke';
  highlight_color: string;
  platform_target: string;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

interface Thumbnail {
  id: string;
  project_id: string;
  user_id: string;
  variant_label: string;
  source_frame_ms: number | null;
  template_id: string | null;
  image_url: string | null;
  local_path: string | null;
  width: number;
  height: number;
  layers: Record<string, unknown>[];
  text_overlays: { text: string; x: number; y: number; font_size: number; color: string }[];
  background_removed: boolean;
  is_uploaded_to_youtube: boolean;
  youtube_ctr: number | null;
  status: 'draft' | 'ready' | 'uploaded' | 'testing' | 'winner';
  created_at: string;
  updated_at: string;
}

interface Template {
  id: string;
  user_id: string | null;
  name: string;
  template_type: 'caption_style' | 'color_preset' | 'transition' | 'intro' | 'outro' | 'lower_third' | 'thumbnail' | 'sound_effect' | 'music';
  category: string;
  description: string;
  preview_url: string | null;
  settings: Record<string, unknown>;
  is_system: boolean;
  is_premium: boolean;
  popularity_score: number;
  created_at: string;
  updated_at: string;
}

interface Export {
  id: string;
  project_id: string;
  user_id: string;
  platform: 'youtube' | 'youtube_shorts' | 'tiktok' | 'instagram_reels' | 'instagram_feed' | 'twitter' | 'custom';
  resolution_width: number;
  resolution_height: number;
  codec: string;
  bitrate_kbps: number | null;
  frame_rate: number;
  loudness_lufs: number;
  include_captions_srt: boolean;
  include_captions_burned: boolean;
  include_chapters: boolean;
  include_thumbnail: boolean;
  output_file_path: string | null;
  file_size_bytes: number | null;
  render_time_seconds: number | null;
  progress_percent: number;
  status: 'queued' | 'rendering' | 'completed' | 'failed' | 'cancelled';
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
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
  transcription_minutes_used: number;
  transcription_minutes_limit: number;
  ai_commands_used: number;
  ai_commands_limit: number;
  storage_used_bytes: number;
  storage_limit_bytes: number;
  export_watermark: boolean;
  max_export_resolution: number;
  created_at: string;
  updated_at: string;
}
```

---

## Seed Data

```sql
-- System caption style templates
INSERT INTO public.templates (id, name, template_type, category, description, settings, is_system, is_premium) VALUES
    (gen_random_uuid(), 'YouTube Standard', 'caption_style', 'captions', 'Clean white text with semi-transparent background', '{"font_family": "Inter", "font_size": 36, "font_color": "#FFFFFF", "background_color": "#000000", "background_opacity": 0.5, "position": "bottom_center", "animation_type": "none"}', true, false),
    (gen_random_uuid(), 'Bold Pop', 'caption_style', 'captions', 'Large bold text with word-by-word highlight', '{"font_family": "Inter", "font_size": 48, "font_color": "#FFFFFF", "background_color": "transparent", "background_opacity": 0, "position": "center", "animation_type": "word_highlight", "highlight_color": "#7C3AED", "outline_width": 3}', true, false),
    (gen_random_uuid(), 'Karaoke', 'caption_style', 'captions', 'Word-by-word karaoke-style fill animation', '{"font_family": "Inter", "font_size": 44, "font_color": "#FFFFFF", "background_color": "transparent", "background_opacity": 0, "position": "bottom_center", "animation_type": "karaoke", "highlight_color": "#FFD700"}', true, false),
    (gen_random_uuid(), 'Minimal', 'caption_style', 'captions', 'Small subtle text at the bottom', '{"font_family": "Inter", "font_size": 24, "font_color": "#CCCCCC", "background_color": "transparent", "background_opacity": 0, "position": "bottom_center", "animation_type": "fade_in"}', true, false),
    (gen_random_uuid(), 'Cinematic', 'caption_style', 'captions', 'Letterboxed cinematic subtitle style', '{"font_family": "Playfair Display", "font_size": 32, "font_color": "#F5F5F5", "background_color": "#000000", "background_opacity": 0.3, "position": "bottom_center", "animation_type": "fade_in", "outline_width": 1}', true, false),
    (gen_random_uuid(), 'Neon Glow', 'caption_style', 'captions', 'Glowing neon text effect', '{"font_family": "Inter", "font_size": 42, "font_color": "#00FF88", "background_color": "transparent", "background_opacity": 0, "position": "center", "animation_type": "word_highlight", "shadow_enabled": true, "highlight_color": "#FF00FF"}', true, true),
    (gen_random_uuid(), 'Typewriter', 'caption_style', 'captions', 'Letter-by-letter typewriter appearance', '{"font_family": "JetBrains Mono", "font_size": 36, "font_color": "#FFFFFF", "background_color": "#1a1a2e", "background_opacity": 0.8, "position": "bottom_center", "animation_type": "typewriter"}', true, true);

-- System color presets
INSERT INTO public.templates (id, name, template_type, category, description, settings, is_system, is_premium) VALUES
    (gen_random_uuid(), 'Natural', 'color_preset', 'color', 'Clean natural look with slight warmth', '{"exposure": 0, "contrast": 5, "saturation": 5, "temperature": 10, "tint": 0, "highlights": -5, "shadows": 5}', true, false),
    (gen_random_uuid(), 'Cinematic Teal', 'color_preset', 'color', 'Popular teal-orange cinematic grade', '{"exposure": 0, "contrast": 15, "saturation": -10, "temperature": -15, "tint": 5, "highlights": -10, "shadows": 10}', true, false),
    (gen_random_uuid(), 'Bright & Clean', 'color_preset', 'color', 'Bright, clean look for product reviews', '{"exposure": 10, "contrast": 5, "saturation": 10, "temperature": 0, "tint": 0, "highlights": 0, "shadows": 15}', true, false),
    (gen_random_uuid(), 'Moody', 'color_preset', 'color', 'Dark moody grade with lifted blacks', '{"exposure": -5, "contrast": 20, "saturation": -15, "temperature": -10, "tint": 0, "highlights": -15, "shadows": -5}', true, true),
    (gen_random_uuid(), 'Vintage Film', 'color_preset', 'color', 'Warm vintage film emulation', '{"exposure": 5, "contrast": -5, "saturation": -20, "temperature": 20, "tint": 5, "highlights": -10, "shadows": 15}', true, true);

-- Platform export presets (stored in app config, referenced here for documentation)
-- YouTube: 3840x2160, H.264/VP9, 30fps, -14 LUFS
-- YouTube Shorts: 1080x1920, H.264, 30fps, -14 LUFS
-- TikTok: 1080x1920, H.264, 30fps, max 3 min
-- Instagram Reels: 1080x1920, H.264, 30fps, max 90s
-- Instagram Feed: 1080x1080, H.264, 30fps, max 60s
-- Twitter/X: 1920x1080, H.264, 30fps, max 2:20
```

---

## Local SQLite Cache Notes

```
-- VaultEdit is a video editor -- local-first is CRITICAL.
-- The primary editing state lives locally. Supabase is for cloud backup and sync.
--
-- Tables stored locally (SQLite):
-- projects (full project state including edit_state JSON)
-- media_files (metadata only -- actual video files on local disk)
-- transcripts (full word-level data for offline editing)
-- edits (complete edit decision list)
-- captions (full caption data)
-- thumbnails (metadata, images cached on disk)
-- templates (all system + user templates)
-- ai_commands (history for undo)
-- exports (render queue and history)
--
-- Local-only data (never synced):
-- Video/audio binary files (too large, stored on local disk)
-- Render cache (temporary frames, deleted after export)
-- Waveform visualizations (regenerated on demand)
-- Preview proxy files (lower-res copies for smooth playback)
--
-- Sync strategy:
-- 1. Project metadata syncs to Supabase on save
-- 2. Transcripts sync after generation (Whisper requires internet anyway)
-- 3. Edit decision lists sync on every save (small JSON payloads)
-- 4. Media files are NOT synced (referenced by local path)
-- 5. Exports sync completion status only
-- 6. Conflict resolution: last-write-wins with vector clock per edit
--
-- Proxy editing:
-- Large 4K files are transcoded to 720p proxies for smooth timeline playback
-- Full-resolution used only during final render
-- Proxies stored in app cache directory with LRU eviction at 10GB
```

---

## Migration Strategy

### File Naming Convention

```
migrations/
  001_initial_schema.sql          -- Users, extensions (pg_trgm)
  002_projects.sql                -- Projects table
  003_media_files.sql             -- Media files table
  004_transcripts.sql             -- Transcripts table
  005_edits.sql                   -- Edits (edit decision list)
  006_captions.sql                -- Captions table
  007_templates.sql               -- Templates table
  008_thumbnails.sql              -- Thumbnails table
  009_exports.sql                 -- Exports table
  010_subscriptions.sql           -- Subscriptions table
  011_ai_commands.sql             -- AI command history
  012_indexes.sql                 -- All indexes
  013_rls_policies.sql            -- Row level security
  014_functions_triggers.sql      -- Functions and triggers
  015_seed_templates.sql          -- Caption styles, color presets
```

### Execution Order

1. Run migrations sequentially (001 through 015)
2. Enable `pg_trgm` extension in migration 001
3. Templates table created before thumbnails (FK dependency)
4. RLS policies applied after all tables exist
5. Triggers applied after functions are created
6. Seed data (templates, presets) inserted last
7. Local SQLite schema mirrors cloud schema with additional local-only columns (local_path, proxy_path, cache_status)

---

*Schema designed for an AI video editor that gets creators from raw footage to published video faster.*
