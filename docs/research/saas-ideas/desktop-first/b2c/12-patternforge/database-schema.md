# PatternForge -- Database Schema

> Complete database schema for the AI 3D printing design studio. Supabase (PostgreSQL) for cloud sync and marketplace, with local SQLite cache for offline parametric editing.

---

## Entity Relationship Summary

```
users
  |-- 1:N -- designs
  |-- 1:N -- subscriptions
  |-- 1:N -- printer_profiles
  |-- 1:N -- generation_queue
  |-- 1:N -- marketplace_listings (as seller)
  |-- 1:N -- downloads (as buyer)
  |
  designs
    |-- 1:N -- generations (version history)
    |-- 1:N -- print_settings
    |-- 1:1 -- marketplace_listings (optional)
  |
  materials (reference table, global)
  |
  marketplace_listings
    |-- 1:N -- downloads
    |-- 1:N -- reviews
```

**Key relationships:**
- A **user** creates multiple **designs**, each with a conversation and version history
- **Generations** track every AI iteration on a design (text-to-3D, modifications)
- **Print settings** store material/printer/quality configs per design
- **Materials** are a global reference table with printability parameters
- **Marketplace listings** connect designs to the community store
- **Downloads** track who downloaded or purchased which listings

---

## Complete SQL DDL

### Users Table

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    username TEXT UNIQUE,
    bio TEXT DEFAULT '',
    experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
    default_printer_id UUID,
    default_material TEXT DEFAULT 'PLA',
    default_units TEXT DEFAULT 'mm' CHECK (default_units IN ('mm', 'inches')),
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    ai_verbosity TEXT DEFAULT 'detailed' CHECK (ai_verbosity IN ('concise', 'detailed', 'expert')),
    generation_quality TEXT DEFAULT 'balanced' CHECK (generation_quality IN ('fast', 'balanced', 'best')),
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Designs Table

```sql
CREATE TABLE public.designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Untitled Design',
    description TEXT DEFAULT '',
    original_prompt TEXT,
    category TEXT DEFAULT 'custom' CHECK (category IN ('containers', 'stands', 'hooks', 'covers', 'organizers', 'decorative', 'mechanical', 'adapters', 'cases', 'custom')),
    tags JSONB DEFAULT '[]'::jsonb,
    current_version INTEGER DEFAULT 1,
    dimensions_mm JSONB DEFAULT '{"width": 0, "height": 0, "depth": 0}'::jsonb,
    volume_cm3 NUMERIC(12, 2),
    triangle_count INTEGER DEFAULT 0,
    file_size_bytes BIGINT DEFAULT 0,
    stl_file_url TEXT,
    thumbnail_url TEXT,
    parameters JSONB DEFAULT '{}'::jsonb,
    printability_score INTEGER DEFAULT 0 CHECK (printability_score >= 0 AND printability_score <= 100),
    printability_issues JSONB DEFAULT '[]'::jsonb,
    conversation_history JSONB DEFAULT '[]'::jsonb,
    is_public BOOLEAN DEFAULT false,
    is_favorited BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'exported', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Generations Table (Version History)

```sql
CREATE TABLE public.generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    prompt TEXT NOT NULL,
    generation_type TEXT NOT NULL DEFAULT 'text_to_3d' CHECK (generation_type IN ('text_to_3d', 'modification', 'image_to_3d', 'remix', 'parametric_change')),
    input_params JSONB DEFAULT '{}'::jsonb,
    output_params JSONB DEFAULT '{}'::jsonb,
    stl_file_url TEXT,
    thumbnail_url TEXT,
    dimensions_mm JSONB,
    printability_score INTEGER CHECK (printability_score >= 0 AND printability_score <= 100),
    model_used TEXT,
    processing_time_ms INTEGER,
    openscad_script TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Print Settings Table

```sql
CREATE TABLE public.print_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    printer_profile_id UUID,
    material TEXT NOT NULL DEFAULT 'PLA',
    layer_height_mm NUMERIC(4, 2) DEFAULT 0.20,
    infill_percent INTEGER DEFAULT 20 CHECK (infill_percent >= 0 AND infill_percent <= 100),
    nozzle_temp_c INTEGER DEFAULT 210,
    bed_temp_c INTEGER DEFAULT 60,
    print_speed_mm_s INTEGER DEFAULT 50,
    supports TEXT DEFAULT 'auto' CHECK (supports IN ('none', 'auto', 'everywhere')),
    quality_preset TEXT DEFAULT 'normal' CHECK (quality_preset IN ('draft', 'normal', 'fine')),
    estimated_time_minutes INTEGER,
    estimated_filament_grams NUMERIC(8, 2),
    estimated_cost_usd NUMERIC(8, 2),
    orientation JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Printer Profiles Table

```sql
CREATE TABLE public.printer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    manufacturer TEXT,
    model TEXT,
    bed_size_x_mm NUMERIC(8, 2) NOT NULL DEFAULT 220,
    bed_size_y_mm NUMERIC(8, 2) NOT NULL DEFAULT 220,
    bed_size_z_mm NUMERIC(8, 2) NOT NULL DEFAULT 250,
    nozzle_diameter_mm NUMERIC(4, 2) NOT NULL DEFAULT 0.40,
    printer_type TEXT DEFAULT 'fdm' CHECK (printer_type IN ('fdm', 'sla', 'sls')),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Materials Table (Global Reference)

```sql
CREATE TABLE public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    min_wall_thickness_mm NUMERIC(4, 2) NOT NULL,
    max_overhang_degrees INTEGER NOT NULL,
    max_bridge_distance_mm NUMERIC(6, 2) NOT NULL,
    default_nozzle_temp_c INTEGER,
    default_bed_temp_c INTEGER,
    density_g_cm3 NUMERIC(6, 3),
    cost_per_kg_usd NUMERIC(8, 2),
    strengths TEXT[],
    printer_type TEXT DEFAULT 'fdm' CHECK (printer_type IN ('fdm', 'sla', 'sls')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Marketplace Listings Table

```sql
CREATE TABLE public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    price_usd NUMERIC(8, 2) DEFAULT 0.00,
    is_free BOOLEAN DEFAULT true,
    category TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    thumbnail_url TEXT,
    preview_images JSONB DEFAULT '[]'::jsonb,
    download_count INTEGER DEFAULT 0,
    rating_average NUMERIC(3, 2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    printability_score INTEGER,
    recommended_material TEXT,
    dimensions_mm JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'removed', 'flagged')),
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Downloads Table

```sql
CREATE TABLE public.downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    price_paid_usd NUMERIC(8, 2) DEFAULT 0.00,
    stripe_payment_id TEXT,
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_remix BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (listing_id, user_id)
);
```

### Subscriptions Table

```sql
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'maker', 'pro')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    designs_generated_this_month INTEGER DEFAULT 0,
    designs_limit INTEGER DEFAULT 3,
    storage_used_bytes BIGINT DEFAULT 0,
    storage_limit_bytes BIGINT DEFAULT 524288000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Generation Queue Table

```sql
CREATE TABLE public.generation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    generation_type TEXT NOT NULL DEFAULT 'text_to_3d',
    priority INTEGER DEFAULT 0,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    current_step TEXT,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);

-- Designs
CREATE INDEX idx_designs_user_id ON public.designs(user_id);
CREATE INDEX idx_designs_category ON public.designs(category);
CREATE INDEX idx_designs_status ON public.designs(status);
CREATE INDEX idx_designs_printability ON public.designs(printability_score DESC);
CREATE INDEX idx_designs_created_at ON public.designs(created_at DESC);
CREATE INDEX idx_designs_is_public ON public.designs(is_public) WHERE is_public = true;
CREATE INDEX idx_designs_tags ON public.designs USING gin (tags);

-- Generations
CREATE INDEX idx_generations_design_id ON public.generations(design_id);
CREATE INDEX idx_generations_user_id ON public.generations(user_id);
CREATE INDEX idx_generations_version ON public.generations(design_id, version DESC);
CREATE INDEX idx_generations_status ON public.generations(status);

-- Print Settings
CREATE INDEX idx_print_settings_design_id ON public.print_settings(design_id);
CREATE INDEX idx_print_settings_user_id ON public.print_settings(user_id);

-- Printer Profiles
CREATE INDEX idx_printer_profiles_user_id ON public.printer_profiles(user_id);

-- Marketplace
CREATE INDEX idx_marketplace_seller_id ON public.marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_category ON public.marketplace_listings(category);
CREATE INDEX idx_marketplace_status ON public.marketplace_listings(status);
CREATE INDEX idx_marketplace_price ON public.marketplace_listings(price_usd);
CREATE INDEX idx_marketplace_rating ON public.marketplace_listings(rating_average DESC);
CREATE INDEX idx_marketplace_downloads ON public.marketplace_listings(download_count DESC);
CREATE INDEX idx_marketplace_featured ON public.marketplace_listings(featured) WHERE featured = true;
CREATE INDEX idx_marketplace_tags ON public.marketplace_listings USING gin (tags);

-- Full-text search on marketplace
CREATE INDEX idx_marketplace_title_trgm ON public.marketplace_listings USING gin (title gin_trgm_ops);
CREATE INDEX idx_marketplace_description_trgm ON public.marketplace_listings USING gin (description gin_trgm_ops);

-- Downloads
CREATE INDEX idx_downloads_listing_id ON public.downloads(listing_id);
CREATE INDEX idx_downloads_buyer_id ON public.downloads(buyer_id);
CREATE INDEX idx_downloads_seller_id ON public.downloads(seller_id);

-- Reviews
CREATE INDEX idx_reviews_listing_id ON public.reviews(listing_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- Generation Queue
CREATE INDEX idx_gen_queue_user_id ON public.generation_queue(user_id);
CREATE INDEX idx_gen_queue_status ON public.generation_queue(status);
CREATE INDEX idx_gen_queue_priority ON public.generation_queue(priority DESC, created_at ASC);

-- Enable trigram extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

## Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_queue ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Public profiles for marketplace" ON public.users FOR SELECT USING (true);

-- Designs: user owns their designs
CREATE POLICY "Users can CRUD own designs" ON public.designs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public designs are readable" ON public.designs FOR SELECT USING (is_public = true);

-- Generations
CREATE POLICY "Users can CRUD own generations" ON public.generations FOR ALL USING (auth.uid() = user_id);

-- Print Settings
CREATE POLICY "Users can CRUD own print settings" ON public.print_settings FOR ALL USING (auth.uid() = user_id);

-- Printer Profiles
CREATE POLICY "Users can CRUD own printer profiles" ON public.printer_profiles FOR ALL USING (auth.uid() = user_id);

-- Materials: globally readable
CREATE POLICY "Materials are publicly readable" ON public.materials FOR SELECT USING (true);

-- Marketplace Listings: readable by all, writable by seller
CREATE POLICY "Listings are publicly readable" ON public.marketplace_listings FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);
CREATE POLICY "Sellers can insert listings" ON public.marketplace_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own listings" ON public.marketplace_listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own listings" ON public.marketplace_listings FOR DELETE USING (auth.uid() = seller_id);

-- Downloads
CREATE POLICY "Users can read own downloads" ON public.downloads FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can insert downloads" ON public.downloads FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Reviews
CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can read own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Generation Queue
CREATE POLICY "Users can CRUD own queue items" ON public.generation_queue FOR ALL USING (auth.uid() = user_id);
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
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.designs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.print_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.printer_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.marketplace_listings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));

    INSERT INTO public.subscriptions (user_id, plan, status, designs_limit, storage_limit_bytes)
    VALUES (NEW.id, 'free', 'active', 3, 524288000);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update marketplace listing rating when a review is added
CREATE OR REPLACE FUNCTION public.update_listing_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.marketplace_listings
    SET
        rating_average = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE listing_id = NEW.listing_id),
        rating_count = (SELECT COUNT(*) FROM public.reviews WHERE listing_id = NEW.listing_id)
    WHERE id = NEW.listing_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_listing_rating();

-- Increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.marketplace_listings
    SET download_count = download_count + 1
    WHERE id = NEW.listing_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER increment_downloads_on_purchase
    AFTER INSERT ON public.downloads
    FOR EACH ROW EXECUTE FUNCTION public.increment_download_count();

-- Check generation limit before queueing
CREATE OR REPLACE FUNCTION public.check_generation_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    max_limit INTEGER;
BEGIN
    SELECT designs_generated_this_month, designs_limit
    INTO current_count, max_limit
    FROM public.subscriptions
    WHERE user_id = p_user_id AND status = 'active'
    LIMIT 1;

    IF max_limit = -1 THEN RETURN true; END IF;
    RETURN current_count < max_limit;
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
  username: string | null;
  bio: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  default_printer_id: string | null;
  default_material: string;
  default_units: 'mm' | 'inches';
  onboarding_completed: boolean;
  ai_verbosity: 'concise' | 'detailed' | 'expert';
  generation_quality: 'fast' | 'balanced' | 'best';
  theme: 'dark' | 'light' | 'system';
  created_at: string;
  updated_at: string;
}

interface Design {
  id: string;
  user_id: string;
  name: string;
  description: string;
  original_prompt: string | null;
  category: 'containers' | 'stands' | 'hooks' | 'covers' | 'organizers' | 'decorative' | 'mechanical' | 'adapters' | 'cases' | 'custom';
  tags: string[];
  current_version: number;
  dimensions_mm: { width: number; height: number; depth: number };
  volume_cm3: number | null;
  triangle_count: number;
  file_size_bytes: number;
  stl_file_url: string | null;
  thumbnail_url: string | null;
  parameters: Record<string, unknown>;
  printability_score: number;
  printability_issues: { type: string; severity: string; description: string }[];
  conversation_history: { role: string; content: string; timestamp: string }[];
  is_public: boolean;
  is_favorited: boolean;
  status: 'draft' | 'generating' | 'ready' | 'exported' | 'archived';
  created_at: string;
  updated_at: string;
}

interface Generation {
  id: string;
  design_id: string;
  user_id: string;
  version: number;
  prompt: string;
  generation_type: 'text_to_3d' | 'modification' | 'image_to_3d' | 'remix' | 'parametric_change';
  input_params: Record<string, unknown>;
  output_params: Record<string, unknown>;
  stl_file_url: string | null;
  thumbnail_url: string | null;
  dimensions_mm: { width: number; height: number; depth: number } | null;
  printability_score: number | null;
  model_used: string | null;
  processing_time_ms: number | null;
  openscad_script: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  error_message: string | null;
  created_at: string;
}

interface PrintSettings {
  id: string;
  design_id: string;
  user_id: string;
  printer_profile_id: string | null;
  material: string;
  layer_height_mm: number;
  infill_percent: number;
  nozzle_temp_c: number;
  bed_temp_c: number;
  print_speed_mm_s: number;
  supports: 'none' | 'auto' | 'everywhere';
  quality_preset: 'draft' | 'normal' | 'fine';
  estimated_time_minutes: number | null;
  estimated_filament_grams: number | null;
  estimated_cost_usd: number | null;
  orientation: { x: number; y: number; z: number };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface Material {
  id: string;
  name: string;
  display_name: string;
  min_wall_thickness_mm: number;
  max_overhang_degrees: number;
  max_bridge_distance_mm: number;
  default_nozzle_temp_c: number | null;
  default_bed_temp_c: number | null;
  density_g_cm3: number | null;
  cost_per_kg_usd: number | null;
  strengths: string[];
  printer_type: 'fdm' | 'sla' | 'sls';
  created_at: string;
}

interface MarketplaceListing {
  id: string;
  design_id: string;
  seller_id: string;
  title: string;
  description: string;
  price_usd: number;
  is_free: boolean;
  category: string;
  tags: string[];
  thumbnail_url: string | null;
  preview_images: string[];
  download_count: number;
  rating_average: number;
  rating_count: number;
  printability_score: number | null;
  recommended_material: string | null;
  dimensions_mm: { width: number; height: number; depth: number } | null;
  status: 'draft' | 'active' | 'paused' | 'removed' | 'flagged';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

interface Download {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  price_paid_usd: number;
  stripe_payment_id: string | null;
  downloaded_at: string;
  is_remix: boolean;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'maker' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  designs_generated_this_month: number;
  designs_limit: number;
  storage_used_bytes: number;
  storage_limit_bytes: number;
  created_at: string;
  updated_at: string;
}

interface GenerationQueueItem {
  id: string;
  user_id: string;
  design_id: string | null;
  prompt: string;
  generation_type: string;
  priority: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress_percent: number;
  current_step: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}
```

---

## Seed Data

```sql
-- Materials reference data
INSERT INTO public.materials (name, display_name, min_wall_thickness_mm, max_overhang_degrees, max_bridge_distance_mm, default_nozzle_temp_c, default_bed_temp_c, density_g_cm3, cost_per_kg_usd, strengths, printer_type) VALUES
    ('PLA', 'PLA', 0.80, 45, 10.00, 210, 60, 1.240, 20.00, ARRAY['Easy to print', 'Biodegradable', 'Low warping'], 'fdm'),
    ('PETG', 'PETG', 1.00, 40, 8.00, 240, 80, 1.270, 25.00, ARRAY['Strong', 'Food-safe', 'Chemical resistant'], 'fdm'),
    ('ABS', 'ABS', 1.20, 40, 8.00, 245, 100, 1.040, 22.00, ARRAY['Heat resistant', 'Strong', 'Acetone smoothing'], 'fdm'),
    ('TPU', 'TPU (Flexible)', 1.50, 50, 5.00, 225, 50, 1.210, 35.00, ARRAY['Flexible', 'Impact resistant', 'Durable'], 'fdm'),
    ('ASA', 'ASA', 1.20, 40, 8.00, 250, 100, 1.070, 30.00, ARRAY['UV resistant', 'Outdoor use', 'Weather resistant'], 'fdm'),
    ('NYLON', 'Nylon', 1.20, 35, 6.00, 260, 80, 1.140, 40.00, ARRAY['Very strong', 'Slightly flexible', 'Wear resistant'], 'fdm'),
    ('RESIN', 'Standard Resin (SLA)', 0.30, 90, 0.00, NULL, NULL, 1.100, 50.00, ARRAY['High detail', 'Smooth finish', 'Complex geometry'], 'sla');

-- Default printer profiles (common printers)
-- These would be inserted when a user selects their printer during onboarding

-- Marketplace categories seed
-- Categories are enforced at the application level via the design category check constraint
```

---

## Local SQLite Cache Notes

```
-- Tables mirrored locally for offline parametric editing:
-- designs (active project only)
-- generations (version history for active design)
-- print_settings (for active design)
-- printer_profiles (all user profiles)
-- materials (full reference table, rarely changes)
--
-- STL file cache:
-- Binary STL files stored in app data directory
-- LRU eviction policy at 5GB local cache limit
-- Thumbnails cached as PNG at 256x256
--
-- Sync strategy:
-- 1. On design open: pull latest from Supabase if online
-- 2. Parametric edits: apply locally first, queue sync
-- 3. Generation requests: require internet (OpenAI API dependency)
-- 4. Export: works fully offline from local STL cache
-- 5. Conflict resolution: server version wins for generations,
--    client version wins for parametric changes with timestamp merge
```

---

## Migration Strategy

### File Naming Convention

```
migrations/
  001_initial_schema.sql          -- Users, extensions
  002_designs_generations.sql     -- Designs, generations tables
  003_print_settings.sql          -- Print settings, printer profiles
  004_materials.sql               -- Materials reference table
  005_marketplace.sql             -- Listings, downloads, reviews
  006_subscriptions.sql           -- Subscriptions, generation queue
  007_indexes.sql                 -- All indexes
  008_rls_policies.sql            -- Row level security
  009_functions_triggers.sql      -- Functions and triggers
  010_seed_materials.sql          -- Material reference data
```

### Execution Order

1. Run migrations sequentially (001 through 010)
2. Enable `pg_trgm` extension before creating trigram indexes
3. RLS policies applied after all tables exist
4. Triggers applied after functions are created
5. Material seed data inserted last
6. Marketplace categories seeded via application code
7. Local SQLite schema auto-generated from TypeScript interfaces

---

*Schema designed for an AI-powered 3D printing design studio that turns words into printable objects.*
