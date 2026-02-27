-- ============================================================
-- StoryThread: Initial Schema
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- users (public profile table linked to auth.users)
-- Queried as 'users' by sharing.ts: .from('users').select('full_name, pen_name')
-- ────────────────────────────────────────────────────────────
create table if not exists public.users (
  id               uuid primary key references auth.users (id) on delete cascade,
  email            text,
  full_name        text,
  avatar_url       text,
  bio              text,
  pen_name         text,
  favorite_genres  text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users manage own profile"
  on public.users for all
  using (auth.uid() = id);

-- Published author names are readable by anyone (for the public story reader)
create policy "Public can read author names"
  on public.users for select
  using (true);

-- Trigger: create a users row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- stories
-- ────────────────────────────────────────────────────────────
create table if not exists public.stories (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  title            text not null,
  description      text,
  genre            text not null default 'other',
  status           text not null default 'draft',
  cover_url        text,
  tags             text[] not null default '{}',
  total_word_count integer not null default 0,
  chapter_count    integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.stories enable row level security;

create policy "Users manage own stories"
  on public.stories for all
  using (auth.uid() = user_id);

-- Published stories are publicly readable (for the sharing/reader feature)
create policy "Public can read published stories"
  on public.stories for select
  using (status = 'published');

create index idx_stories_user
  on public.stories (user_id, updated_at desc);

create index idx_stories_published
  on public.stories (status, updated_at desc)
  where status = 'published';

-- ────────────────────────────────────────────────────────────
-- chapters
-- ────────────────────────────────────────────────────────────
create table if not exists public.chapters (
  id           uuid primary key default gen_random_uuid(),
  story_id     uuid not null references public.stories (id) on delete cascade,
  title        text not null,
  content      text not null default '',
  status       text not null default 'draft',
  order_index  integer not null default 0,
  word_count   integer not null default 0,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.chapters enable row level security;

-- Access governed through parent story ownership
create policy "Users manage own chapters"
  on public.chapters for all
  using (
    exists (
      select 1 from public.stories s
      where s.id = chapters.story_id
        and auth.uid() = s.user_id
    )
  );

-- Published chapters of published stories are publicly readable
create policy "Public can read published chapters"
  on public.chapters for select
  using (
    status = 'published'
    and exists (
      select 1 from public.stories s
      where s.id = chapters.story_id
        and s.status = 'published'
    )
  );

create index idx_chapters_story
  on public.chapters (story_id, order_index);

-- ────────────────────────────────────────────────────────────
-- characters
-- ────────────────────────────────────────────────────────────
create table if not exists public.characters (
  id            uuid primary key default gen_random_uuid(),
  story_id      uuid not null references public.stories (id) on delete cascade,
  name          text not null,
  role          text not null default 'supporting',
  appearance    text,
  personality   text,
  backstory     text,
  voice_notes   text,
  relationships text,
  image_url     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.characters enable row level security;

create policy "Users manage own characters"
  on public.characters for all
  using (
    exists (
      select 1 from public.stories s
      where s.id = characters.story_id
        and auth.uid() = s.user_id
    )
  );

create index idx_characters_story
  on public.characters (story_id, created_at);

-- ────────────────────────────────────────────────────────────
-- world_elements
-- ────────────────────────────────────────────────────────────
create table if not exists public.world_elements (
  id          uuid primary key default gen_random_uuid(),
  story_id    uuid not null references public.stories (id) on delete cascade,
  name        text not null,
  type        text not null default 'location',
  description text,
  details     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.world_elements enable row level security;

create policy "Users manage own world elements"
  on public.world_elements for all
  using (
    exists (
      select 1 from public.stories s
      where s.id = world_elements.story_id
        and auth.uid() = s.user_id
    )
  );

create index idx_world_elements_story
  on public.world_elements (story_id, type, created_at);

-- ────────────────────────────────────────────────────────────
-- ai_generations
-- ────────────────────────────────────────────────────────────
create table if not exists public.ai_generations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  story_id    uuid references public.stories (id) on delete set null,
  chapter_id  uuid references public.chapters (id) on delete set null,
  action_type text not null,
  prompt      text not null,
  result      text not null,
  tokens_used integer not null default 0,
  model       text not null,
  created_at  timestamptz not null default now()
);

alter table public.ai_generations enable row level security;

create policy "Users manage own ai generations"
  on public.ai_generations for all
  using (auth.uid() = user_id);

create index idx_ai_generations_user
  on public.ai_generations (user_id, created_at desc);

create index idx_ai_generations_story
  on public.ai_generations (story_id, created_at desc);
