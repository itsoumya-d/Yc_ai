-- StoryThread: Social & Collaboration Features
-- Adds collaborative writing, social engagement, and monetization tables

-- ============================================================
-- Collaborators (multi-user story writing)
-- ============================================================
create table if not exists public.collaborators (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'writer' check (role in ('owner', 'writer', 'editor', 'viewer')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'removed')),
  invited_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz default now(),
  unique (story_id, user_id)
);

alter table public.collaborators enable row level security;

create policy "Story owners can manage collaborators"
  on public.collaborators for all using (
    exists (select 1 from public.stories where stories.id = collaborators.story_id and stories.user_id = auth.uid())
  );

create policy "Users can view own collaborations"
  on public.collaborators for select using (auth.uid() = user_id);

create policy "Users can accept/decline own invites"
  on public.collaborators for update using (auth.uid() = user_id);

-- ============================================================
-- Comments (on stories and chapters)
-- ============================================================
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  is_spoiler boolean not null default false,
  is_pinned boolean not null default false,
  upvote_count integer not null default 0,
  is_hidden boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.comments enable row level security;

create policy "Comments are publicly readable"
  on public.comments for select using (is_hidden = false);

create policy "Users can create comments"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "Users can update own comments"
  on public.comments for update using (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- ============================================================
-- Reactions (emoji reactions on chapters)
-- ============================================================
create table if not exists public.reactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'love', 'surprised', 'sad', 'laughing')),
  created_at timestamptz default now(),
  unique (user_id, chapter_id, reaction_type)
);

alter table public.reactions enable row level security;

create policy "Reactions are publicly readable"
  on public.reactions for select using (true);

create policy "Users can manage own reactions"
  on public.reactions for all using (auth.uid() = user_id);

-- ============================================================
-- Reading Lists
-- ============================================================
create table if not exists public.reading_lists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  is_public boolean not null default false,
  story_count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.reading_list_items (
  id uuid primary key default uuid_generate_v4(),
  reading_list_id uuid not null references public.reading_lists(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  sort_order integer not null default 0,
  added_at timestamptz default now(),
  unique (reading_list_id, story_id)
);

alter table public.reading_lists enable row level security;
alter table public.reading_list_items enable row level security;

create policy "Public lists are viewable, own lists manageable"
  on public.reading_lists for select using (is_public = true or user_id = auth.uid());

create policy "Users can manage own lists"
  on public.reading_lists for all using (auth.uid() = user_id);

create policy "Viewable via list access"
  on public.reading_list_items for select using (
    exists (select 1 from public.reading_lists where reading_lists.id = reading_list_items.reading_list_id
      and (reading_lists.is_public = true or reading_lists.user_id = auth.uid()))
  );

create policy "Manageable via list ownership"
  on public.reading_list_items for all using (
    exists (select 1 from public.reading_lists where reading_lists.id = reading_list_items.reading_list_id
      and reading_lists.user_id = auth.uid())
  );

-- ============================================================
-- Reading Progress
-- ============================================================
create table if not exists public.reading_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete set null,
  last_chapter_number integer not null default 0,
  scroll_position numeric(5,2) default 0,
  is_completed boolean not null default false,
  started_at timestamptz default now(),
  last_read_at timestamptz default now(),
  unique (user_id, story_id)
);

alter table public.reading_progress enable row level security;

create policy "Users can manage own reading progress"
  on public.reading_progress for all using (auth.uid() = user_id);

-- ============================================================
-- Followers (follow writers)
-- ============================================================
create table if not exists public.followers (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  followed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (follower_id, followed_id),
  check (follower_id != followed_id)
);

alter table public.followers enable row level security;

create policy "Followers are publicly readable"
  on public.followers for select using (true);

create policy "Users can manage own follows"
  on public.followers for all using (auth.uid() = follower_id);

-- ============================================================
-- Writer Subscriptions (readers subscribe to writers)
-- ============================================================
create table if not exists public.writer_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  subscriber_id uuid not null references auth.users(id) on delete cascade,
  writer_id uuid not null references auth.users(id) on delete cascade,
  tier text not null default 'basic',
  price_cents integer not null,
  stripe_subscription_id text,
  status text not null default 'active' check (status in ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (subscriber_id, writer_id)
);

alter table public.writer_subscriptions enable row level security;

create policy "Participants can view writer subs"
  on public.writer_subscriptions for select using (auth.uid() = subscriber_id or auth.uid() = writer_id);

create policy "Subscribers can manage own subs"
  on public.writer_subscriptions for all using (auth.uid() = subscriber_id);

-- ============================================================
-- AI Generations (writing assistance audit log)
-- ============================================================
create table if not exists public.ai_generations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete set null,
  action_type text not null check (action_type in ('continue', 'suggest_dialogue', 'rephrase', 'describe_scene', 'fix_prose', 'name_generator', 'expand_world', 'plot_outline')),
  input_text text,
  output_text text,
  tone text,
  model text not null default 'claude-opus-4-6',
  tokens_used integer default 0,
  was_accepted boolean,
  created_at timestamptz default now()
);

alter table public.ai_generations enable row level security;

create policy "Users can manage own AI generations"
  on public.ai_generations for all using (auth.uid() = user_id);

-- ============================================================
-- Notifications
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('new_chapter', 'comment', 'follow', 'milestone', 'subscription', 'collab_invite', 'system')),
  title text not null,
  body text,
  link_url text,
  reference_id uuid,
  is_read boolean not null default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can manage own notifications"
  on public.notifications for all using (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_collaborators_story_id on public.collaborators(story_id);
create index if not exists idx_collaborators_user_id on public.collaborators(user_id);
create index if not exists idx_comments_story_id on public.comments(story_id);
create index if not exists idx_comments_chapter_id on public.comments(chapter_id);
create index if not exists idx_reactions_chapter_id on public.reactions(chapter_id);
create index if not exists idx_reading_lists_user_id on public.reading_lists(user_id);
create index if not exists idx_reading_progress_user_id on public.reading_progress(user_id);
create index if not exists idx_followers_follower_id on public.followers(follower_id);
create index if not exists idx_followers_followed_id on public.followers(followed_id);
create index if not exists idx_writer_subs_writer_id on public.writer_subscriptions(writer_id);
create index if not exists idx_ai_generations_story_id on public.ai_generations(story_id);
create index if not exists idx_notifications_user_unread on public.notifications(user_id, is_read) where is_read = false;
