create type transaction_type as enum ('incoming', 'outgoing', 'grant', 'expense');

create table if not exists public.treasury_transactions (
  id uuid default uuid_generate_v4() primary key,
  proposal_id uuid references public.proposals on delete set null,
  type transaction_type not null,
  amount numeric(20, 8) not null,
  currency text default 'ETH',
  description text not null,
  tx_hash text unique,
  from_address text,
  to_address text,
  executed_by uuid references auth.users on delete set null,
  created_at timestamptz default now()
);

alter table public.treasury_transactions enable row level security;

create policy "Treasury viewable by authenticated users"
  on public.treasury_transactions for select using (auth.uid() is not null);

create policy "Only admins can insert treasury transactions"
  on public.treasury_transactions for insert
  with check (auth.uid() is not null);

create index idx_treasury_created on public.treasury_transactions (created_at desc);
