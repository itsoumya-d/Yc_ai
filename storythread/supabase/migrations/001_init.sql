-- StoryThread: Collaborative fiction writing platform
-- Initial schema migration

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- Profiles (extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  bio text,
  pen_name text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Stories
-- ============================================================
create table if not exists public.stories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  genre text default 'other',
  status text default 'draft' check (status in ('draft', 'in_progress', 'completed', 'published')),
  cover_url text,
  tags text[] default '{}',
  total_word_count integer default 0,
  chapter_count integer default 0,
  is_public boolean default false,
  share_token text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.stories enable row level security;

create policy "Users can view own stories"
  on public.stories for select using (auth.uid() = user_id or is_public = true);

create policy "Users can insert own stories"
  on public.stories for insert with check (auth.uid() = user_id);

create policy "Users can update own stories"
  on public.stories for update using (auth.uid() = user_id);

create policy "Users can delete own stories"
  on public.stories for delete using (auth.uid() = user_id);

-- ============================================================
-- Chapters
-- ============================================================
create table if not exists public.chapters (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  title text not null,
  content text default '',
  status text default 'draft' check (status in ('draft', 'revision', 'final')),
  order_index integer default 0,
  word_count integer default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.chapters enable row level security;

create policy "Users can view chapters of own stories"
  on public.chapters for select using (
    exists (select 1 from public.stories where stories.id = chapters.story_id and (stories.user_id = auth.uid() or stories.is_public = true))
  );

create policy "Users can insert chapters to own stories"
  on public.chapters for insert with check (
    exists (select 1 from public.stories where stories.id = chapters.story_id and stories.user_id = auth.uid())
  );

create policy "Users can update chapters of own stories"
  on public.chapters for update using (
    exists (select 1 from public.stories where stories.id = chapters.story_id and stories.user_id = auth.uid())
  );

create policy "Users can delete chapters of own stories"
  on public.chapters for delete using (
    exists (select 1 from public.stories where stories.id = chapters.story_id and stories.user_id = auth.uid())
  );

-- ============================================================
-- Characters
-- ============================================================
create table if not exists public.characters (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  name text not null,
  role text default 'supporting' check (role in ('protagonist', 'antagonist', 'supporting', 'minor')),
  appearance text,
  personality text,
  backstory text,
  voice_notes text,
  relationships text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.characters enable row level security;

create policy "Users can view characters of own stories"
  on public.characters for select using (
    exists (select 1 from public.stories where stories.id = characters.story_id and (stories.user_id = auth.uid() or stories.is_public = true))
  );

create policy "Users can insert characters to own stories"
  on public.characters for insert with check (
    exists (select 1 from public.stories where stories.id = characters.story_id and stories.user_id = auth.uid())
  );

create policy "Users can update characters of own stories"
  on public.characters for update using (
    exists (select 1 from public.stories where stories.id = characters.story_id and stories.user_id = auth.uid())
  );

create policy "Users can delete characters of own stories"
  on public.characters for delete using (
    exists (select 1 from public.stories where stories.id = characters.story_id and stories.user_id = auth.uid())
  );

-- ============================================================
-- World Elements (locations, lore, items, etc.)
-- ============================================================
create table if not exists public.world_elements (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  name text not null,
  type text default 'location' check (type in ('location', 'lore', 'item', 'event', 'culture', 'magic', 'technology', 'other')),
  description text,
  details text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.world_elements enable row level security;

create policy "Users can view world elements of own stories"
  on public.world_elements for select using (
    exists (select 1 from public.stories where stories.id = world_elements.story_id and (stories.user_id = auth.uid() or stories.is_public = true))
  );

create policy "Users can insert world elements to own stories"
  on public.world_elements for insert with check (
    exists (select 1 from public.stories where stories.id = world_elements.story_id and stories.user_id = auth.uid())
  );

create policy "Users can update world elements of own stories"
  on public.world_elements for update using (
    exists (select 1 from public.stories where stories.id = world_elements.story_id and stories.user_id = auth.uid())
  );

create policy "Users can delete world elements of own stories"
  on public.world_elements for delete using (
    exists (select 1 from public.stories where stories.id = world_elements.story_id and stories.user_id = auth.uid())
  );

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_stories_user_id on public.stories(user_id);
create index if not exists idx_stories_status on public.stories(status);
create index if not exists idx_chapters_story_id on public.chapters(story_id);
create index if not exists idx_chapters_order on public.chapters(story_id, order_index);
create index if not exists idx_characters_story_id on public.characters(story_id);
create index if not exists idx_world_elements_story_id on public.world_elements(story_id);
create index if not exists idx_world_elements_type on public.world_elements(story_id, type);

-- ============================================================
-- Storage bucket for exports
-- ============================================================
insert into storage.buckets (id, name, public)
values ('exports', 'exports', false)
on conflict (id) do nothing;

create policy "Users can upload exports"
  on storage.objects for insert with check (
    bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[2]
  );

create policy "Users can read own exports"
  on storage.objects for select using (
    bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[2]
  );
