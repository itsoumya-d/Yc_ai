-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- DEALS TABLE
-- ============================================================
create type public.deal_stage as enum (
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
);

create type public.activity_type as enum (
  'note',
  'email',
  'call',
  'meeting',
  'stage_change'
);

create table if not exists public.deals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  company text not null,
  value numeric(12,2) default 0 not null,
  stage text default 'lead' not null,
  probability integer default 50 not null check (probability >= 0 and probability <= 100),
  ai_score integer default 0 not null check (ai_score >= 0 and ai_score <= 100),
  ai_insights text,
  contact_name text,
  contact_email text,
  contact_phone text,
  expected_close_date date,
  description text,
  source text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index deals_user_id_idx on public.deals(user_id);
create index deals_stage_idx on public.deals(stage);
create index deals_ai_score_idx on public.deals(ai_score desc);
create index deals_created_at_idx on public.deals(created_at desc);

alter table public.deals enable row level security;

create policy "Users can manage own deals"
  on public.deals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- DEAL ACTIVITIES TABLE
-- ============================================================
create table if not exists public.deal_activities (
  id uuid default uuid_generate_v4() primary key,
  deal_id uuid references public.deals(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  type text default 'note' not null,
  created_at timestamptz default now() not null
);

create index deal_activities_deal_id_idx on public.deal_activities(deal_id);
create index deal_activities_user_id_idx on public.deal_activities(user_id);
create index deal_activities_created_at_idx on public.deal_activities(created_at desc);

alter table public.deal_activities enable row level security;

create policy "Users can manage own deal activities"
  on public.deal_activities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger deals_updated_at
  before update on public.deals
  for each row execute procedure public.handle_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- NEW USER TRIGGER
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SAMPLE DATA (for demo purposes)
-- ============================================================
-- Note: Sample data would be seeded via the application or a separate seed script
-- after user creation to properly associate with a real user_id.
