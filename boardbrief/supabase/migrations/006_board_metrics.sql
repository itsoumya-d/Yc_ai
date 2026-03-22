-- BoardBrief: Board Metrics for CSV import and analytics
-- Stores KPI/financial metrics imported from CSV (Stripe, QuickBooks, payment processors)

create table if not exists public.board_metrics (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  metric_name text not null,
  value numeric not null,
  period text not null,          -- e.g. "2024-01", "Q1 2024", "Jan 2024"
  category text not null default 'general',  -- revenue, expenses, customers, etc.
  source text not null default 'manual',     -- csv_import, quickbooks, stripe, manual
  imported_at timestamptz not null default now(),
  created_at timestamptz default now(),
  unique (owner_id, metric_name, period)
);

alter table public.board_metrics enable row level security;

create policy "Own board metrics" on public.board_metrics
  for all using (auth.uid() = owner_id);

create index board_metrics_owner_period_idx on public.board_metrics(owner_id, period);
create index board_metrics_owner_category_idx on public.board_metrics(owner_id, category);
