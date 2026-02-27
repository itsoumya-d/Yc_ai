-- KPI (Key Performance Indicator) tracking for BoardBrief
create table if not exists public.kpis (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  description   text,
  category      text not null default 'financial',  -- financial | operational | growth | other
  unit          text not null default 'number',     -- number | percentage | currency | ratio
  target_value  numeric,
  current_value numeric,
  previous_value numeric,
  frequency     text not null default 'monthly',   -- weekly | monthly | quarterly | annual
  is_active     boolean not null default true,
  owner_name    text,
  last_updated  timestamptz default now(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- KPI history entries (snapshots over time)
create table if not exists public.kpi_entries (
  id         uuid primary key default gen_random_uuid(),
  kpi_id     uuid not null references public.kpis(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  value      numeric not null,
  notes      text,
  recorded_at timestamptz not null default now(),
  created_at  timestamptz default now()
);

-- RLS
alter table public.kpis        enable row level security;
alter table public.kpi_entries enable row level security;

create policy "Users manage own KPIs"
  on public.kpis for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own KPI entries"
  on public.kpi_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes
create index if not exists kpis_user_id_idx        on public.kpis(user_id);
create index if not exists kpi_entries_kpi_id_idx  on public.kpi_entries(kpi_id);
create index if not exists kpi_entries_user_id_idx on public.kpi_entries(user_id);
