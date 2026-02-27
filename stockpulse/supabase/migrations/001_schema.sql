-- StockPulse Database Schema
create extension if not exists "uuid-ossp";

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  sku text not null,
  barcode text,
  category text,
  description text,
  stock_quantity integer default 0 not null check (stock_quantity >= 0),
  low_stock_threshold integer default 5 not null check (low_stock_threshold >= 0),
  cost_price numeric(10,2),
  retail_price numeric(10,2),
  supplier text,
  location text,
  image_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, sku)
);

create index products_user_id_idx on public.products(user_id);
create index products_barcode_idx on public.products(barcode);
create index products_sku_idx on public.products(user_id, sku);
create index products_stock_idx on public.products(stock_quantity);

alter table public.products enable row level security;

create policy "Users manage own products"
  on public.products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- SCAN LOGS TABLE
-- ============================================================
create table if not exists public.scan_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  barcode text not null,
  action text not null check (action in ('add', 'remove', 'set', 'lookup')),
  quantity_change integer,
  previous_quantity integer,
  new_quantity integer,
  note text,
  created_at timestamptz default now() not null
);

create index scan_logs_user_id_idx on public.scan_logs(user_id);
create index scan_logs_product_id_idx on public.scan_logs(product_id);
create index scan_logs_created_at_idx on public.scan_logs(created_at desc);
create index scan_logs_barcode_idx on public.scan_logs(barcode);

alter table public.scan_logs enable row level security;

create policy "Users manage own scan logs"
  on public.scan_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- SAMPLE PRODUCTS (for testing)
-- ============================================================
-- Insert via application after user auth.
-- Example structure:
-- INSERT INTO products (user_id, name, sku, barcode, category, stock_quantity, low_stock_threshold, retail_price)
-- VALUES (auth.uid(), 'Product Name', 'SKU001', '012345678901', 'Electronics', 25, 5, 29.99);
