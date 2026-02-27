-- ComplianceSnap: Initial Schema
-- Migration: 001_initial_schema

-- ── Users ──────────────────────────────────────────────────────────
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  organization_name text not null default '',
  role text not null default 'inspector',
  theme text not null default 'dark',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users read own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users update own profile" on public.users
  for update using (auth.uid() = id);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Facilities ─────────────────────────────────────────────────────
create table if not exists public.facilities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  location text not null default '',
  score integer not null default 100 check (score between 0 and 100),
  violations_open integer not null default 0,
  last_inspection timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.facilities enable row level security;

create policy "Users manage own facilities" on public.facilities
  for all using (auth.uid() = user_id);

create index idx_facilities_user on public.facilities(user_id);

-- ── Violations ─────────────────────────────────────────────────────
create table if not exists public.violations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  facility_id uuid references public.facilities(id) on delete set null,
  title text not null,
  severity text not null check (severity in ('critical', 'major', 'minor', 'observation')),
  regulation text not null default '',
  location text not null default '',
  status text not null default 'pending' check (status in ('pending', 'in-progress', 'completed', 'overdue')),
  detected_at timestamptz not null default now(),
  photo_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.violations enable row level security;

create policy "Users manage own violations" on public.violations
  for all using (auth.uid() = user_id);

create index idx_violations_user on public.violations(user_id);
create index idx_violations_facility on public.violations(facility_id);
create index idx_violations_severity on public.violations(severity);

-- ── Inspections ────────────────────────────────────────────────────
create table if not exists public.inspections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  facility_id uuid references public.facilities(id) on delete set null,
  facility_name text not null default '',
  type text not null default 'general',
  status text not null default 'draft' check (status in ('draft', 'in-progress', 'completed', 'syncing')),
  violations_found integer not null default 0,
  score integer not null default 0 check (score between 0 and 100),
  date timestamptz not null default now(),
  inspector text not null default '',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inspections enable row level security;

create policy "Users manage own inspections" on public.inspections
  for all using (auth.uid() = user_id);

create index idx_inspections_user on public.inspections(user_id);
create index idx_inspections_facility on public.inspections(facility_id);

-- ── Corrective Actions ─────────────────────────────────────────────
create table if not exists public.corrective_actions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  violation_id uuid references public.violations(id) on delete set null,
  violation_title text not null default '',
  severity text not null check (severity in ('critical', 'major', 'minor', 'observation')),
  assigned_to text not null default '',
  due_date timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'in-progress', 'completed', 'overdue')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.corrective_actions enable row level security;

create policy "Users manage own corrective actions" on public.corrective_actions
  for all using (auth.uid() = user_id);

create index idx_actions_user on public.corrective_actions(user_id);
create index idx_actions_status on public.corrective_actions(status);
