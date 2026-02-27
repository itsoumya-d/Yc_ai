-- NeighborDAO Initial Schema
-- Run this in your Supabase SQL Editor

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('admin', 'moderator', 'member');
create type post_category as enum ('announcement', 'discussion', 'event', 'alert', 'question');
create type vote_status as enum ('active', 'passed', 'failed', 'cancelled');
create type resource_status as enum ('available', 'borrowed', 'maintenance');

-- ============================================================
-- NEIGHBORHOODS
-- ============================================================
create table neighborhoods (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  description   text,
  address       text,
  city          text not null,
  state         text not null,
  zip_code      text,
  created_by    uuid not null,
  member_count  integer not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- USERS (extends auth.users via trigger)
-- ============================================================
create table users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null unique,
  full_name       text,
  avatar_url      text,
  neighborhood_id uuid references neighborhoods(id) on delete set null,
  role            user_role not null default 'member',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Add FK from neighborhoods.created_by to users after users table is created
alter table neighborhoods
  add constraint neighborhoods_created_by_fkey
  foreign key (created_by) references users(id) on delete restrict;

-- ============================================================
-- POSTS
-- ============================================================
create table posts (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  content         text not null,
  category        post_category not null default 'discussion',
  author_id       uuid not null references users(id) on delete cascade,
  neighborhood_id uuid not null references neighborhoods(id) on delete cascade,
  likes_count     integer not null default 0,
  comments_count  integer not null default 0,
  is_pinned       boolean not null default false,
  ai_summary      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index posts_neighborhood_id_idx on posts(neighborhood_id);
create index posts_author_id_idx on posts(author_id);
create index posts_created_at_idx on posts(created_at desc);

-- ============================================================
-- POST LIKES
-- ============================================================
create table post_likes (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references posts(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

create index post_likes_post_id_idx on post_likes(post_id);

-- ============================================================
-- COMMENTS
-- ============================================================
create table comments (
  id              uuid primary key default uuid_generate_v4(),
  post_id         uuid not null references posts(id) on delete cascade,
  author_id       uuid not null references users(id) on delete cascade,
  content         text not null,
  created_at      timestamptz not null default now()
);

create index comments_post_id_idx on comments(post_id);

-- ============================================================
-- VOTES
-- ============================================================
create table votes (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text not null default '',
  neighborhood_id uuid not null references neighborhoods(id) on delete cascade,
  created_by      uuid not null references users(id) on delete cascade,
  status          vote_status not null default 'active',
  total_votes     integer not null default 0,
  ends_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index votes_neighborhood_id_idx on votes(neighborhood_id);
create index votes_status_idx on votes(status);

-- ============================================================
-- VOTE OPTIONS
-- ============================================================
create table vote_options (
  id          uuid primary key default uuid_generate_v4(),
  vote_id     uuid not null references votes(id) on delete cascade,
  text        text not null,
  votes_count integer not null default 0
);

create index vote_options_vote_id_idx on vote_options(vote_id);

-- ============================================================
-- USER VOTES
-- ============================================================
create table user_votes (
  id         uuid primary key default uuid_generate_v4(),
  vote_id    uuid not null references votes(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  option_id  uuid not null references vote_options(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(vote_id, user_id)
);

create index user_votes_vote_id_idx on user_votes(vote_id);
create index user_votes_user_id_idx on user_votes(user_id);

-- ============================================================
-- RESOURCES
-- ============================================================
create table resources (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  description     text,
  category        text not null,
  owner_id        uuid not null references users(id) on delete cascade,
  neighborhood_id uuid not null references neighborhoods(id) on delete cascade,
  status          resource_status not null default 'available',
  image_url       text,
  borrower_id     uuid references users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index resources_neighborhood_id_idx on resources(neighborhood_id);
create index resources_owner_id_idx on resources(owner_id);
create index resources_status_idx on resources(status);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create user profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, users.full_name),
    updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Toggle post like
create or replace function toggle_post_like(p_post_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  if exists (
    select 1 from post_likes where post_id = p_post_id and user_id = p_user_id
  ) then
    delete from post_likes where post_id = p_post_id and user_id = p_user_id;
    update posts set likes_count = greatest(0, likes_count - 1) where id = p_post_id;
  else
    insert into post_likes (post_id, user_id) values (p_post_id, p_user_id);
    update posts set likes_count = likes_count + 1 where id = p_post_id;
  end if;
end;
$$;

-- Increment vote count
create or replace function increment_vote_count(p_option_id uuid, p_vote_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update vote_options set votes_count = votes_count + 1 where id = p_option_id;
  update votes set total_votes = total_votes + 1 where id = p_vote_id;
end;
$$;

-- Increment neighborhood member count
create or replace function increment_neighborhood_members(p_neighborhood_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update neighborhoods
  set member_count = member_count + 1
  where id = p_neighborhood_id;
end;
$$;

-- Update comment count trigger
create or replace function update_comment_count()
returns trigger
language plpgsql
as $$
begin
  if (TG_OP = 'INSERT') then
    update posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif (TG_OP = 'DELETE') then
    update posts set comments_count = greatest(0, comments_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger on_comment_change
  after insert or delete on comments
  for each row execute procedure update_comment_count();

-- Updated_at timestamp triggers
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_posts_updated_at
  before update on posts
  for each row execute procedure update_updated_at();

create trigger update_votes_updated_at
  before update on votes
  for each row execute procedure update_updated_at();

create trigger update_resources_updated_at
  before update on resources
  for each row execute procedure update_updated_at();

create trigger update_neighborhoods_updated_at
  before update on neighborhoods
  for each row execute procedure update_updated_at();

create trigger update_users_updated_at
  before update on users
  for each row execute procedure update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table users enable row level security;
alter table neighborhoods enable row level security;
alter table posts enable row level security;
alter table post_likes enable row level security;
alter table comments enable row level security;
alter table votes enable row level security;
alter table vote_options enable row level security;
alter table user_votes enable row level security;
alter table resources enable row level security;

-- Users policies
create policy "Users can view all users" on users
  for select using (true);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

-- Neighborhoods policies
create policy "Anyone can view neighborhoods" on neighborhoods
  for select using (true);

create policy "Authenticated users can create neighborhoods" on neighborhoods
  for insert with check (auth.uid() = created_by);

create policy "Admins can update neighborhood" on neighborhoods
  for update using (
    exists (
      select 1 from users
      where id = auth.uid()
        and neighborhood_id = neighborhoods.id
        and role in ('admin', 'moderator')
    )
  );

-- Posts policies
create policy "Neighborhood members can view posts" on posts
  for select using (
    neighborhood_id in (
      select neighborhood_id from users where id = auth.uid()
    )
  );

create policy "Neighborhood members can create posts" on posts
  for insert with check (
    auth.uid() = author_id
    and neighborhood_id in (
      select neighborhood_id from users where id = auth.uid()
    )
  );

create policy "Authors and admins can update posts" on posts
  for update using (
    auth.uid() = author_id
    or exists (
      select 1 from users
      where id = auth.uid()
        and neighborhood_id = posts.neighborhood_id
        and role in ('admin', 'moderator')
    )
  );

create policy "Authors and admins can delete posts" on posts
  for delete using (
    auth.uid() = author_id
    or exists (
      select 1 from users
      where id = auth.uid()
        and neighborhood_id = posts.neighborhood_id
        and role in ('admin', 'moderator')
    )
  );

-- Post likes policies
create policy "Members can view likes" on post_likes
  for select using (true);

create policy "Members can manage own likes" on post_likes
  for all using (auth.uid() = user_id);

-- Comments policies
create policy "Members can view comments" on comments
  for select using (true);

create policy "Members can create comments" on comments
  for insert with check (auth.uid() = author_id);

create policy "Authors can delete own comments" on comments
  for delete using (auth.uid() = author_id);

-- Votes policies
create policy "Members can view votes in their neighborhood" on votes
  for select using (
    neighborhood_id in (
      select neighborhood_id from users where id = auth.uid()
    )
  );

create policy "Members can create votes" on votes
  for insert with check (
    auth.uid() = created_by
    and neighborhood_id in (
      select neighborhood_id from users where id = auth.uid()
    )
  );

create policy "Creator and admins can update votes" on votes
  for update using (
    auth.uid() = created_by
    or exists (
      select 1 from users
      where id = auth.uid()
        and neighborhood_id = votes.neighborhood_id
        and role in ('admin', 'moderator')
    )
  );

-- Vote options policies
create policy "Anyone can view vote options" on vote_options
  for select using (true);

create policy "Vote creator can insert options" on vote_options
  for insert with check (
    exists (
      select 1 from votes where id = vote_options.vote_id and created_by = auth.uid()
    )
  );

-- User votes policies
create policy "Users can view their own votes" on user_votes
  for select using (true);

create policy "Users can vote once" on user_votes
  for insert with check (auth.uid() = user_id);

-- Resources policies
create policy "Members can view neighborhood resources" on resources
  for select using (
    neighborhood_id in (
      select neighborhood_id from users where id = auth.uid()
    )
  );

create policy "Members can add resources" on resources
  for insert with check (
    auth.uid() = owner_id
    and neighborhood_id in (
      select neighborhood_id from users where id = auth.uid()
    )
  );

create policy "Owner and borrower can update resources" on resources
  for update using (
    auth.uid() = owner_id
    or auth.uid() = borrower_id
    or exists (
      select 1 from users
      where id = auth.uid()
        and neighborhood_id = resources.neighborhood_id
        and role in ('admin', 'moderator')
    )
  );

create policy "Owner can delete resources" on resources
  for delete using (auth.uid() = owner_id);

-- ============================================================
-- SAMPLE DATA (optional - comment out in production)
-- ============================================================
-- Uncomment and adjust the UUIDs below to seed test data.
-- You need to create auth users first through Supabase Auth.

/*
-- Example neighborhood
insert into neighborhoods (name, city, state, zip_code, created_by, member_count)
values ('Maplewood Heights', 'Austin', 'TX', '78701', '<your-user-id>', 1);
*/
