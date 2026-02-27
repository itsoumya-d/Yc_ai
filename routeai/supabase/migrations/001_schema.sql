-- RouteAI Database Schema
create extension if not exists "uuid-ossp";
create extension if not exists "postgis"; -- For geospatial queries (optional)

-- ============================================================
-- TECHNICIANS TABLE
-- ============================================================
create table if not exists public.technicians (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  skills text[] default '{}',
  active boolean default true not null,
  status text default 'available' check (status in ('available', 'en_route', 'on_job', 'offline')),
  current_job_id uuid,
  last_lat double precision,
  last_lng double precision,
  last_seen_at timestamptz,
  jobs_today integer default 0,
  created_at timestamptz default now() not null
);

create index technicians_user_id_idx on public.technicians(user_id);
create index technicians_active_idx on public.technicians(active) where active = true;

alter table public.technicians enable row level security;

create policy "Users manage own technicians"
  on public.technicians for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- JOBS TABLE
-- ============================================================
create table if not exists public.jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  technician_id uuid references public.technicians(id) on delete set null,
  title text not null,
  job_type text,
  customer_name text,
  customer_phone text,
  customer_email text,
  address text,
  lat double precision,
  lng double precision,
  description text,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text default 'normal' check (priority in ('urgent', 'high', 'normal', 'low')),
  scheduled_date timestamptz not null default now(),
  scheduled_time text,
  estimated_duration integer default 60,
  route_order integer,
  checklist boolean[] default '{}',
  field_notes text[] default '{}',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index jobs_user_id_idx on public.jobs(user_id);
create index jobs_technician_id_idx on public.jobs(technician_id);
create index jobs_scheduled_date_idx on public.jobs(scheduled_date);
create index jobs_status_idx on public.jobs(status);
create index jobs_priority_idx on public.jobs(priority);
create index jobs_route_order_idx on public.jobs(route_order);

alter table public.jobs enable row level security;

create policy "Users manage own jobs"
  on public.jobs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Technicians can see/update their assigned jobs
create policy "Technicians view assigned jobs"
  on public.jobs for select
  using (
    technician_id in (
      select id from public.technicians where user_id = auth.uid()
    )
  );

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

create trigger jobs_updated_at
  before update on public.jobs
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- DAILY JOBS COUNT FUNCTION
-- ============================================================
create or replace function public.update_technician_job_count()
returns void as $$
  update public.technicians t
  set jobs_today = (
    select count(*)
    from public.jobs j
    where j.technician_id = t.id
      and j.scheduled_date::date = current_date
      and j.status != 'cancelled'
  );
$$ language sql security definer;
