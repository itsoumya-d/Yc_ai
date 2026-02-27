-- ============================================================
-- StockPulse: AI Inventory Scanner - Initial Schema
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ─── Organizations ──────────────────────────────────
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  industry text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
  subscription_expires_at timestamptz,
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_organizations_slug on organizations(slug);

-- ─── Profiles ──────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  default_org_id uuid references organizations(id) on delete set null,
  push_opted_in boolean not null default true,
  email_opted_in boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Org Members ────────────────────────────────────
create table org_members (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'admin', 'manager', 'staff')),
  invited_email text,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(org_id, user_id)
);

create index idx_org_members_user on org_members(user_id);
create index idx_org_members_org on org_members(org_id);

-- ─── Categories ─────────────────────────────────────
create table categories (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  name text not null,
  icon text,
  sort_order integer not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_categories_org on categories(org_id);

-- ─── Products ───────────────────────────────────────
create table products (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  sku text,
  barcode text,
  description text,
  category_id uuid references categories(id) on delete set null,
  unit text not null default 'each' check (unit in ('each', 'case', 'lb', 'oz', 'kg', 'g', 'liter', 'gallon')),
  reorder_point integer not null default 10,
  reorder_quantity integer not null default 20,
  price_cents integer,
  cost_cents integer,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_org on products(org_id);
create index idx_products_barcode on products(barcode);
create index idx_products_sku on products(org_id, sku);
create index idx_products_category on products(category_id);

-- ─── Inventory Locations ────────────────────────────
create table inventory_locations (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_inventory_locations_org on inventory_locations(org_id);

-- ─── Inventory ──────────────────────────────────────
create table inventory (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  location_id uuid not null references inventory_locations(id) on delete cascade,
  quantity integer not null default 0,
  expiration_date date,
  lot_number text,
  last_counted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_inventory_org on inventory(org_id);
create index idx_inventory_product on inventory(product_id);
create index idx_inventory_location on inventory(location_id);
create unique index idx_inventory_product_location on inventory(product_id, location_id);

-- ─── Scans ──────────────────────────────────────────
create table scans (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  scan_type text not null check (scan_type in ('full_count', 'spot_check', 'receiving')),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'cancelled')),
  location_id uuid references inventory_locations(id) on delete set null,
  items_count integer not null default 0,
  discrepancies_count integer not null default 0,
  notes text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_scans_org on scans(org_id);
create index idx_scans_user on scans(user_id);

-- ─── Scan Items ─────────────────────────────────────
create table scan_items (
  id uuid primary key default uuid_generate_v4(),
  scan_id uuid not null references scans(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  expected_quantity integer,
  counted_quantity integer not null default 0,
  discrepancy integer,
  notes text,
  scanned_at timestamptz not null default now()
);

create index idx_scan_items_scan on scan_items(scan_id);

-- ─── Suppliers ──────────────────────────────────────
create table suppliers (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_suppliers_org on suppliers(org_id);

-- ─── Purchase Orders ────────────────────────────────
create table purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  supplier_id uuid not null references suppliers(id) on delete cascade,
  order_number text not null,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'confirmed', 'received', 'cancelled')),
  total_cents integer not null default 0,
  notes text,
  expected_delivery date,
  submitted_at timestamptz,
  received_at timestamptz,
  created_by uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_purchase_orders_org on purchase_orders(org_id);
create index idx_purchase_orders_supplier on purchase_orders(supplier_id);
create index idx_purchase_orders_status on purchase_orders(status);

-- ─── PO Line Items ──────────────────────────────────
create table po_line_items (
  id uuid primary key default uuid_generate_v4(),
  po_id uuid not null references purchase_orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null,
  unit_cost_cents integer not null default 0,
  total_cents integer not null default 0,
  received_quantity integer,
  created_at timestamptz not null default now()
);

create index idx_po_line_items_po on po_line_items(po_id);

-- ─── Stock Alerts ───────────────────────────────────
create table stock_alerts (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  alert_type text not null check (alert_type in ('low_stock', 'out_of_stock', 'expiration', 'reorder')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  message text not null,
  is_resolved boolean not null default false,
  resolved_at timestamptz,
  resolved_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create index idx_stock_alerts_org on stock_alerts(org_id);
create index idx_stock_alerts_product on stock_alerts(product_id);
create index idx_stock_alerts_unresolved on stock_alerts(org_id) where is_resolved = false;

-- ─── Expiration Alerts ──────────────────────────────
create table expiration_alerts (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  inventory_id uuid not null references inventory(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  expiration_date date not null,
  days_until_expiry integer not null,
  is_resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_expiration_alerts_org on expiration_alerts(org_id);

-- ─── Price History ──────────────────────────────────
create table price_history (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  price_cents integer not null,
  cost_cents integer,
  effective_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index idx_price_history_product on price_history(product_id);

-- ─── Barcode Mappings ───────────────────────────────
create table barcode_mappings (
  id uuid primary key default uuid_generate_v4(),
  barcode text not null,
  product_id uuid not null references products(id) on delete cascade,
  source text,
  created_at timestamptz not null default now()
);

create unique index idx_barcode_mappings_barcode on barcode_mappings(barcode);
create index idx_barcode_mappings_product on barcode_mappings(product_id);

-- ─── Count Schedules ────────────────────────────────
create table count_schedules (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  scan_type text not null check (scan_type in ('full_count', 'spot_check', 'receiving')),
  location_id uuid references inventory_locations(id) on delete set null,
  frequency_days integer not null default 7,
  next_count_date date not null,
  last_count_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_count_schedules_org on count_schedules(org_id);

-- ─── Subscription Events ────────────────────────────
create table subscription_events (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  event_type text not null,
  stripe_event_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_subscription_events_org on subscription_events(org_id);

-- ─── Audit Log ──────────────────────────────────────
create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  changes jsonb not null default '{}',
  ip_address inet,
  created_at timestamptz not null default now()
);

create index idx_audit_log_org on audit_log(org_id);
create index idx_audit_log_user on audit_log(user_id);
create index idx_audit_log_entity on audit_log(entity_type, entity_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table org_members enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table inventory_locations enable row level security;
alter table inventory enable row level security;
alter table scans enable row level security;
alter table scan_items enable row level security;
alter table suppliers enable row level security;
alter table purchase_orders enable row level security;
alter table po_line_items enable row level security;
alter table stock_alerts enable row level security;
alter table expiration_alerts enable row level security;
alter table price_history enable row level security;
alter table barcode_mappings enable row level security;
alter table count_schedules enable row level security;
alter table subscription_events enable row level security;
alter table audit_log enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Org members: users can see members of their own org
create policy "Users can view org members" on org_members for select using (
  user_id = auth.uid() or org_id in (select org_id from org_members where user_id = auth.uid())
);

-- Organizations: users can see orgs they belong to
create policy "Users can view their organizations" on organizations for select using (
  id in (select org_id from org_members where user_id = auth.uid())
);
create policy "Admins can update organizations" on organizations for update using (
  id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin'))
);

-- Org-scoped tables policy helper (products, inventory, etc.)
create policy "Org members can view products" on products for select using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);
create policy "Org members can insert products" on products for insert with check (
  org_id in (select org_id from org_members where user_id = auth.uid())
);
create policy "Org members can update products" on products for update using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);

create policy "Org members can view categories" on categories for select using (
  is_default = true or org_id in (select org_id from org_members where user_id = auth.uid())
);

create policy "Org members can view inventory locations" on inventory_locations for select using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);

create policy "Org members can view inventory" on inventory for select using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);
create policy "Org members can insert inventory" on inventory for insert with check (
  org_id in (select org_id from org_members where user_id = auth.uid())
);
create policy "Org members can update inventory" on inventory for update using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);

create policy "Org members can view scans" on scans for select using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);
create policy "Org members can insert scans" on scans for insert with check (
  org_id in (select org_id from org_members where user_id = auth.uid())
);
create policy "Org members can update scans" on scans for update using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);

create policy "Org members can view scan items" on scan_items for select using (
  scan_id in (select id from scans where org_id in (select org_id from org_members where user_id = auth.uid()))
);
create policy "Org members can insert scan items" on scan_items for insert with check (
  scan_id in (select id from scans where org_id in (select org_id from org_members where user_id = auth.uid()))
);

create policy "Org members can view suppliers" on suppliers for select using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);
create policy "Org members can insert suppliers" on suppliers for insert with check (
  org_id in (select org_id from org_members where user_id = auth.uid())
);
create policy "Org members can update suppliers" on suppliers for update using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);

create policy "Org members can view purchase orders" on purchase_orders for select using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);
create policy "Org members can insert purchase orders" on purchase_orders for insert with check (
  org_id in (select org_id from org_members where user_id = auth.uid())
);
create policy "Org members can update purchase orders" on purchase_orders for update using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);

create policy "Org members can view po line items" on po_line_items for select using (
  po_id in (select id from purchase_orders where org_id in (select org_id from org_members where user_id = auth.uid()))
);
create policy "Org members can insert po line items" on po_line_items for insert with check (
  po_id in (select id from purchase_orders where org_id in (select org_id from org_members where user_id = auth.uid()))
);

create policy "Org members can view stock alerts" on stock_alerts for select using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);
create policy "Org members can update stock alerts" on stock_alerts for update using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);

create policy "Org members can view expiration alerts" on expiration_alerts for select using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);

create policy "Org members can view price history" on price_history for select using (
  product_id in (select id from products where org_id in (select org_id from org_members where user_id = auth.uid()))
);

create policy "Org members can view barcode mappings" on barcode_mappings for select using (
  product_id in (select id from products where org_id in (select org_id from org_members where user_id = auth.uid()))
);

create policy "Org members can view count schedules" on count_schedules for select using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);

create policy "Org members can view subscription events" on subscription_events for select using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);

create policy "Org members can view audit log" on audit_log for select using (
  org_id in (select org_id from org_members where user_id = auth.uid())
);

-- ============================================================
-- Functions & Triggers
-- ============================================================

-- handle_new_user: auto-create profile + org on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  new_org_id uuid;
begin
  -- Create profile
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  -- Create default organization
  insert into public.organizations (name, slug)
  values (
    coalesce(new.raw_user_meta_data ->> 'full_name', 'My Store') || '''s Store',
    new.id::text
  )
  returning id into new_org_id;

  -- Add user as owner
  insert into public.org_members (org_id, user_id, role)
  values (new_org_id, new.id, 'owner');

  -- Set default org
  update public.profiles set default_org_id = new_org_id where id = new.id;

  -- Create default location
  insert into public.inventory_locations (org_id, name, is_default)
  values (new_org_id, 'Main Storage', true);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger function
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on organizations for each row execute function update_updated_at();
create trigger set_updated_at before update on profiles for each row execute function update_updated_at();
create trigger set_updated_at before update on products for each row execute function update_updated_at();
create trigger set_updated_at before update on inventory_locations for each row execute function update_updated_at();
create trigger set_updated_at before update on inventory for each row execute function update_updated_at();
create trigger set_updated_at before update on suppliers for each row execute function update_updated_at();
create trigger set_updated_at before update on purchase_orders for each row execute function update_updated_at();
create trigger set_updated_at before update on count_schedules for each row execute function update_updated_at();

-- ============================================================
-- Seed Default Categories
-- ============================================================

insert into categories (name, icon, sort_order, is_default) values
  ('Food & Beverage', 'utensils', 1, true),
  ('Cleaning Supplies', 'spray-can', 2, true),
  ('Paper Goods', 'file-text', 3, true),
  ('Beverages', 'coffee', 4, true),
  ('Produce', 'apple', 5, true),
  ('Dairy', 'milk', 6, true),
  ('Meat & Seafood', 'beef', 7, true),
  ('Frozen', 'snowflake', 8, true);
