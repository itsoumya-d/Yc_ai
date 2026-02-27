-- SiteSync Database Schema
create extension if not exists "uuid-ossp";

-- ============================================================
-- SITES TABLE
-- ============================================================
create table if not exists public.sites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  address text,
  phase text default 'Foundation',
  status text default 'active' check (status in ('active', 'completed', 'on_hold')),
  progress_pct integer default 0 check (progress_pct >= 0 and progress_pct <= 100),
  start_date date,
  end_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index sites_user_id_idx on public.sites(user_id);
create index sites_status_idx on public.sites(status);

alter table public.sites enable row level security;

create policy "Users manage own sites"
  on public.sites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- SITE PHOTOS TABLE
-- ============================================================
create table if not exists public.site_photos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  site_id uuid references public.sites(id) on delete set null,
  photo_url text,
  storage_path text,
  construction_phase text,
  notes text,
  gps_lat double precision,
  gps_lng double precision,
  has_safety_violation boolean default false not null,
  ai_tags text[],
  ai_description text,
  captured_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

create index site_photos_user_id_idx on public.site_photos(user_id);
create index site_photos_site_id_idx on public.site_photos(site_id);
create index site_photos_captured_at_idx on public.site_photos(captured_at desc);
create index site_photos_safety_idx on public.site_photos(has_safety_violation) where has_safety_violation = true;

alter table public.site_photos enable row level security;

create policy "Users manage own photos"
  on public.site_photos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- REPORTS TABLE
-- ============================================================
create table if not exists public.reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  site_id uuid references public.sites(id) on delete set null,
  title text not null,
  content text,
  photo_count integer default 0,
  safety_violations integer default 0,
  status text default 'completed' check (status in ('draft', 'completed', 'shared')),
  created_at timestamptz default now() not null
);

create index reports_user_id_idx on public.reports(user_id);
create index reports_site_id_idx on public.reports(site_id);

alter table public.reports enable row level security;

create policy "Users manage own reports"
  on public.reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Create storage bucket via Supabase dashboard or:
-- insert into storage.buckets (id, name, public) values ('site-photos', 'site-photos', true);

-- Storage policy:
-- create policy "Authenticated users upload"
--   on storage.objects for insert
--   with check (bucket_id = 'site-photos' and auth.role() = 'authenticated');

-- ============================================================
-- TRIGGERS
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sites_updated_at
  before update on public.sites
  for each row execute procedure public.handle_updated_at();
