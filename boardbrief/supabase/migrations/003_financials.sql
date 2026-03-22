-- QuickBooks OAuth connections
create table if not exists public.qb_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  realm_id text not null,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz,
  connected_at timestamptz default now()
);

-- KPI snapshots (daily historical record)
create table if not exists public.kpi_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  mrr decimal,
  arr decimal,
  mrr_growth decimal,
  churn_rate decimal,
  new_customers integer,
  total_customers integer,
  snapshot_date date default current_date,
  created_at timestamptz default now(),
  unique (user_id, snapshot_date)
);

alter table public.qb_connections enable row level security;
alter table public.kpi_snapshots enable row level security;

create policy "Own qb connections" on public.qb_connections for all using (auth.uid() = user_id);
create policy "Own kpi snapshots" on public.kpi_snapshots for all using (auth.uid() = user_id);
