-- ============================================================
-- ProposalPilot: Initial Schema
-- Must run BEFORE 001_add_share_token.sql
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- profiles
-- ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  company     text,
  email       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id);

-- Trigger: create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
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
-- clients
-- ────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  company     text,
  email       text,
  phone       text,
  industry    text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Users manage own clients"
  on public.clients for all
  using (auth.uid() = user_id);

create index idx_clients_user
  on public.clients (user_id, created_at desc);

-- ────────────────────────────────────────────────────────────
-- templates
-- ────────────────────────────────────────────────────────────
create table if not exists public.templates (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade,  -- null for default/system templates
  name        text not null,
  description text,
  industry    text,
  category    text,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.templates enable row level security;

-- Users can read their own templates AND all default/system templates
create policy "Users read own or default templates"
  on public.templates for select
  using (auth.uid() = user_id or is_default = true);

create policy "Users manage own templates"
  on public.templates for insert
  with check (auth.uid() = user_id);

create policy "Users update own templates"
  on public.templates for update
  using (auth.uid() = user_id);

create policy "Users delete own non-default templates"
  on public.templates for delete
  using (auth.uid() = user_id and is_default = false);

create index idx_templates_user
  on public.templates (user_id, created_at desc);

-- ────────────────────────────────────────────────────────────
-- template_sections
-- ────────────────────────────────────────────────────────────
create table if not exists public.template_sections (
  id           uuid primary key default gen_random_uuid(),
  template_id  uuid not null references public.templates (id) on delete cascade,
  title        text not null,
  content      text not null default '',
  order_index  integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.template_sections enable row level security;

-- Access is governed through the parent template's ownership
create policy "Users manage own template sections"
  on public.template_sections for all
  using (
    exists (
      select 1 from public.templates t
      where t.id = template_sections.template_id
        and (auth.uid() = t.user_id or t.is_default = true)
    )
  );

create index idx_template_sections_template
  on public.template_sections (template_id, order_index);

-- ────────────────────────────────────────────────────────────
-- proposals
-- NOTE: share_token column is added by 001_add_share_token.sql
-- ────────────────────────────────────────────────────────────
create table if not exists public.proposals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  client_id      uuid references public.clients (id) on delete set null,
  template_id    uuid references public.templates (id) on delete set null,
  title          text not null,
  status         text not null default 'draft',
  value          numeric(14, 2) not null default 0,
  currency       text not null default 'USD',
  pricing_model  text not null default 'fixed',
  valid_until    date,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.proposals enable row level security;

create policy "Users manage own proposals"
  on public.proposals for all
  using (auth.uid() = user_id);

create index idx_proposals_user
  on public.proposals (user_id, updated_at desc);

create index idx_proposals_client
  on public.proposals (client_id);

-- ────────────────────────────────────────────────────────────
-- proposal_sections
-- ────────────────────────────────────────────────────────────
create table if not exists public.proposal_sections (
  id            uuid primary key default gen_random_uuid(),
  proposal_id   uuid not null references public.proposals (id) on delete cascade,
  title         text not null,
  content       text not null default '',
  order_index   integer not null default 0,
  section_type  text not null default 'custom',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.proposal_sections enable row level security;

-- Access governed through the parent proposal's ownership
create policy "Users manage own proposal sections"
  on public.proposal_sections for all
  using (
    exists (
      select 1 from public.proposals p
      where p.id = proposal_sections.proposal_id
        and auth.uid() = p.user_id
    )
  );

create index idx_proposal_sections_proposal
  on public.proposal_sections (proposal_id, order_index);

-- ────────────────────────────────────────────────────────────
-- content_blocks
-- ────────────────────────────────────────────────────────────
create table if not exists public.content_blocks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  content     text not null,
  block_type  text not null default 'case_study',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.content_blocks enable row level security;

create policy "Users manage own content blocks"
  on public.content_blocks for all
  using (auth.uid() = user_id);

create index idx_content_blocks_user
  on public.content_blocks (user_id, block_type, title);

-- ────────────────────────────────────────────────────────────
-- ai_generations
-- ────────────────────────────────────────────────────────────
create table if not exists public.ai_generations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  proposal_id uuid references public.proposals (id) on delete set null,
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
