-- ProposalPilot: Initial Database Schema
-- Migration: 000_initial_schema (runs before 001_add_share_token)

-- Users table (extends Supabase auth.users)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  business_name text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  industry text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Templates (default templates have null user_id)
create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  industry text,
  category text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Template sections
create table if not exists template_sections (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references templates(id) on delete cascade,
  title text not null,
  content text not null default '',
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Proposals
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  template_id uuid references templates(id) on delete set null,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'viewed', 'won', 'lost', 'expired', 'archived')),
  value numeric not null default 0,
  currency text not null default 'USD',
  pricing_model text not null default 'fixed' check (pricing_model in ('fixed', 'time_materials', 'retainer', 'value_based', 'milestone')),
  valid_until date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Proposal sections
create table if not exists proposal_sections (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  title text not null,
  content text not null default '',
  order_index integer not null default 0,
  section_type text not null default 'custom' check (section_type in ('executive_summary', 'scope', 'timeline', 'pricing', 'team', 'case_studies', 'terms', 'custom')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reusable content blocks
create table if not exists content_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null default '',
  block_type text not null check (block_type in ('case_study', 'team_bio', 'methodology', 'terms', 'about', 'faq')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- AI generation audit trail
create table if not exists ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  proposal_id uuid references proposals(id) on delete set null,
  prompt text not null,
  result text not null,
  tokens_used integer not null default 0,
  model text not null default 'gpt-4o-mini',
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_clients_user on clients(user_id);
create index idx_proposals_user on proposals(user_id, status);
create index idx_proposals_client on proposals(client_id);
create index idx_proposals_updated on proposals(user_id, updated_at desc);
create index idx_proposal_sections_proposal on proposal_sections(proposal_id, order_index);
create index idx_template_sections_template on template_sections(template_id, order_index);
create index idx_content_blocks_user on content_blocks(user_id, block_type);
create index idx_ai_generations_user on ai_generations(user_id, created_at desc);

-- Row-Level Security
alter table users enable row level security;
alter table clients enable row level security;
alter table templates enable row level security;
alter table template_sections enable row level security;
alter table proposals enable row level security;
alter table proposal_sections enable row level security;
alter table content_blocks enable row level security;
alter table ai_generations enable row level security;

-- Users can only access their own profile
create policy "Users manage own profile"
  on users for all using (auth.uid() = id) with check (auth.uid() = id);

-- Users can only access their own clients
create policy "Users manage own clients"
  on clients for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Templates: users see defaults + their own
create policy "Users view default templates"
  on templates for select using (is_default = true or auth.uid() = user_id);

create policy "Users manage own templates"
  on templates for insert with check (auth.uid() = user_id);

create policy "Users update own templates"
  on templates for update using (auth.uid() = user_id);

create policy "Users delete own templates"
  on templates for delete using (auth.uid() = user_id);

-- Template sections: readable for visible templates
create policy "Template sections readable"
  on template_sections for select
  using (
    exists (
      select 1 from templates
      where templates.id = template_sections.template_id
      and (templates.is_default = true or templates.user_id = auth.uid())
    )
  );

create policy "Users manage own template sections"
  on template_sections for all
  using (
    exists (
      select 1 from templates
      where templates.id = template_sections.template_id
      and templates.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from templates
      where templates.id = template_sections.template_id
      and templates.user_id = auth.uid()
    )
  );

-- Users can only access their own proposals
create policy "Users manage own proposals"
  on proposals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Proposal sections: accessible through proposal ownership
create policy "Users manage own proposal sections"
  on proposal_sections for all
  using (
    exists (
      select 1 from proposals
      where proposals.id = proposal_sections.proposal_id
      and proposals.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from proposals
      where proposals.id = proposal_sections.proposal_id
      and proposals.user_id = auth.uid()
    )
  );

-- Users can only access their own content blocks
create policy "Users manage own content blocks"
  on content_blocks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Users can only access their own AI generations
create policy "Users manage own AI generations"
  on ai_generations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create user record on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Seed default templates
insert into templates (name, description, industry, category, is_default) values
  ('Consulting Proposal', 'Professional consulting engagement proposal', 'Consulting', 'services', true),
  ('Software Development', 'Custom software development project proposal', 'Technology', 'development', true),
  ('Marketing Campaign', 'Digital marketing campaign proposal', 'Marketing', 'marketing', true),
  ('Design Project', 'UI/UX design project proposal', 'Design', 'creative', true),
  ('General Business', 'General business services proposal', null, 'general', true)
on conflict do nothing;
