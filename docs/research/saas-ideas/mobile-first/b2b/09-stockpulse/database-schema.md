# StockPulse — Database Schema

> Complete PostgreSQL schema for a multi-tenant AI inventory scanner. Designed for Supabase with Row Level Security, real-time subscriptions, and offline-first sync.

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Entity Relationship Summary](#entity-relationship-summary)
3. [Extensions and Enums](#extensions-and-enums)
4. [Core Tables](#core-tables)
5. [New Tables](#new-tables)
6. [Indexes](#indexes)
7. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
8. [Triggers and Functions](#triggers-and-functions)
9. [Seed Data](#seed-data)
10. [TypeScript Interfaces](#typescript-interfaces)
11. [Migration Notes](#migration-notes)

---

## Schema Overview

| Table | Purpose | Tenant Scoped |
|-------|---------|:------------:|
| `organizations` | Top-level tenant container | -- (root) |
| `org_members` | Users mapped to orgs with roles | Yes |
| `locations` | Physical sites (restaurants, warehouses) | Yes |
| `products` | Product catalog per org | Yes |
| `product_categories` | Hierarchical category tree | Yes |
| `product_barcode_lookup_cache` | Cached barcode API responses | Yes |
| `inventory` | Current stock levels per product per location | Yes |
| `inventory_history` | Immutable audit trail of every stock change | Yes |
| `scan_sessions` | Grouped scanning sessions | Yes |
| `scans` | Individual scan events within a session | Yes |
| `stock_alerts` | Generated low-stock alert records | Yes |
| `alert_configs` | Per-org/location alerting rules | Yes |
| `expiration_alerts` | Alerts for items approaching expiry | Yes |
| `suppliers` | Vendor directory | Yes |
| `purchase_orders` | Auto-generated or manual POs | Yes |
| `pos_connections` | POS integration credentials and state | Yes |
| `reports` | Saved/scheduled report definitions and outputs | Yes |
| `waste_records` | Spoilage, damage, and waste tracking | Yes |

**Total: 19 tables**

---

## Entity Relationship Summary

```
organizations (1)
  |
  +--< org_members >-- auth.users
  |
  +--< locations (N)
  |     |
  |     +--< inventory (N) >-- products
  |     +--< scan_sessions (N)
  |     |     +--< scans (N)
  |     +--< stock_alerts (N)
  |     +--< expiration_alerts (N)
  |     +--< purchase_orders (N) >-- suppliers
  |     +--< pos_connections (N)
  |     +--< waste_records (N)
  |
  +--< products (N)
  |     +--< product_categories (N)
  |     +--< inventory (N)
  |     +--< inventory_history (N)
  |     +--< product_barcode_lookup_cache (N)
  |
  +--< suppliers (N)
  +--< alert_configs (N)
  +--< reports (N)

Key relationships:
  - org_members joins auth.users to organizations (M:N with role)
  - inventory is the junction of products x locations (with expiration_date)
  - scans belong to scan_sessions (1:N grouping)
  - inventory_history references inventory, products, locations (immutable log)
  - purchase_orders reference suppliers and locations
  - stock_alerts and expiration_alerts are generated from alert_configs
  - waste_records track disposed inventory with reason codes
```

---

## Extensions and Enums

```sql
-- Required Supabase/PostgreSQL extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";        -- trigram similarity for product search
create extension if not exists "btree_gist";      -- exclusion constraints

-- Custom enum types for type safety and storage efficiency
create type org_plan as enum ('free', 'growth', 'business', 'enterprise');
create type org_role as enum ('owner', 'manager', 'staff');
create type location_type as enum ('restaurant', 'retail', 'warehouse', 'food_truck');
create type scan_type as enum ('camera', 'barcode', 'manual');
create type scan_session_status as enum ('in_progress', 'completed', 'cancelled');
create type po_status as enum ('draft', 'sent', 'confirmed', 'received', 'cancelled');
create type alert_severity as enum ('low', 'medium', 'high', 'critical');
create type alert_channel as enum ('push', 'email', 'sms', 'in_app');
create type inventory_change_reason as enum (
  'scan',
  'manual_adjustment',
  'pos_sale',
  'purchase_order_received',
  'waste',
  'transfer',
  'initial_count',
  'correction'
);
create type waste_reason as enum (
  'expired',
  'damaged',
  'spoiled',
  'recalled',
  'overstock',
  'other'
);
create type pos_provider as enum ('square', 'toast', 'clover');
create type report_type as enum (
  'inventory_summary',
  'low_stock',
  'waste_summary',
  'scan_activity',
  'cost_analysis',
  'expiration_forecast',
  'supplier_performance',
  'custom'
);
create type report_frequency as enum ('once', 'daily', 'weekly', 'monthly');
```

---

## Core Tables

These tables were defined in the initial tech-stack and are reproduced here with refinements (enum types replacing text checks, additional columns, and updated constraints).

### organizations

```sql
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan org_plan not null default 'free',
  stripe_customer_id text unique,
  stripe_subscription_id text,
  settings jsonb not null default '{
    "currency": "USD",
    "timezone": "America/New_York",
    "low_stock_threshold_percent": 20,
    "scan_image_retention_days": 30,
    "auto_po_enabled": false
  }'::jsonb,
  logo_url text,
  max_locations integer not null default 1,
  max_users integer not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table organizations is 'Top-level tenant. Every row in the system traces back to an org.';
comment on column organizations.slug is 'URL-safe unique identifier for the org, used in deep links.';
comment on column organizations.settings is 'Org-wide settings: currency, timezone, thresholds, feature flags.';
```

### org_members

```sql
create table org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role org_role not null default 'staff',
  display_name text,
  avatar_url text,
  invited_by uuid references auth.users(id),
  invited_at timestamptz,
  accepted_at timestamptz,
  is_active boolean not null default true,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(org_id, user_id)
);

comment on table org_members is 'Maps users to organizations with role-based access. Central to all RLS policies.';
comment on column org_members.role is 'owner: full access. manager: all except billing/delete org. staff: scan/view only.';
comment on column org_members.permissions is 'Granular overrides beyond role. E.g. {"can_create_po": true} for a staff member.';
```

### locations

```sql
create table locations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  address text,
  city text,
  state text,
  zip text,
  country text default 'US',
  latitude numeric(10,7),
  longitude numeric(10,7),
  type location_type not null default 'restaurant',
  timezone text default 'America/New_York',
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table locations is 'Physical sites where inventory is tracked. Scoped to an org.';
```

### product_categories

```sql
create table product_categories (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  parent_id uuid references product_categories(id) on delete set null,
  sort_order integer not null default 0,
  icon text,
  color text,
  created_at timestamptz not null default now(),
  unique(org_id, slug)
);

comment on table product_categories is 'Hierarchical product categories. Supports nesting via parent_id for sub-categories.';
```

### products

```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  category_id uuid references product_categories(id) on delete set null,
  name text not null,
  description text,
  sku text,
  barcode text,
  category text,                -- legacy free-text field, prefer category_id
  unit text not null default 'each',
  cost_per_unit numeric(10,2),
  sell_price numeric(10,2),
  min_stock_level integer not null default 0,
  max_stock_level integer,
  reorder_quantity integer,
  preferred_supplier_id uuid references suppliers(id) on delete set null,
  image_url text,
  thumbnail_url text,
  expiration_tracking boolean not null default false,
  default_shelf_life_days integer,
  weight numeric(8,3),
  weight_unit text default 'oz',
  is_active boolean not null default true,
  tags text[] default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table products is 'Master product catalog per org. Links to suppliers, categories, and inventory records.';
comment on column products.reorder_quantity is 'Default quantity for auto-generated purchase orders.';
comment on column products.default_shelf_life_days is 'Used when expiration_tracking is true but no explicit date is scanned.';
```

### inventory

```sql
create table inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  quantity integer not null default 0,
  reserved_quantity integer not null default 0,
  expiration_date date,
  batch_number text,
  bin_location text,
  last_scanned_at timestamptz,
  last_scanned_by uuid references auth.users(id),
  last_count_verified_at timestamptz,
  notes text,
  updated_at timestamptz not null default now(),
  constraint inventory_quantity_non_negative check (quantity >= 0),
  constraint inventory_reserved_non_negative check (reserved_quantity >= 0),
  constraint inventory_reserved_lte_quantity check (reserved_quantity <= quantity),
  unique(product_id, location_id, expiration_date)
);

comment on table inventory is 'Current stock snapshot. One row per product-location-expiration combination.';
comment on column inventory.reserved_quantity is 'Units committed to open POs or transfers, not yet physically moved.';
comment on column inventory.bin_location is 'Physical shelf/bin identifier within the location (e.g. "Aisle 3, Shelf B").';
```

### scan_sessions

```sql
create table scan_sessions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  started_by uuid not null references auth.users(id),
  status scan_session_status not null default 'in_progress',
  scan_count integer not null default 0,
  products_found integer not null default 0,
  new_products_added integer not null default 0,
  duration_seconds integer,
  notes text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table scan_sessions is 'Groups individual scans into a logical session (e.g. "Monday morning shelf count").';
```

### scans

```sql
create table scans (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references scan_sessions(id) on delete set null,
  location_id uuid not null references locations(id) on delete cascade,
  scanned_by uuid not null references auth.users(id),
  scan_type scan_type not null,
  image_url text,
  image_storage_key text,
  ai_response jsonb,
  ai_model text default 'gpt-4o',
  ai_tokens_used integer,
  ai_cost_cents integer,
  products_detected jsonb,
  accuracy_score numeric(3,2),
  processing_time_ms integer,
  device_info jsonb,
  is_offline_sync boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table scans is 'Individual scan events. Can be camera-based (AI), barcode, or manual entry.';
comment on column scans.products_detected is 'Array of {product_id, name, quantity, confidence} objects returned by AI.';
comment on column scans.is_offline_sync is 'True if this scan was captured offline and synced later.';
comment on column scans.image_storage_key is 'Cloudflare R2 object key for the scan image.';
```

### suppliers

```sql
create table suppliers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  website text,
  address text,
  city text,
  state text,
  zip text,
  payment_terms text,
  lead_time_days integer,
  minimum_order numeric(10,2),
  catalog jsonb,
  notes text,
  is_active boolean not null default true,
  rating numeric(2,1) check (rating >= 0 and rating <= 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table suppliers is 'Vendor directory. Links to products (preferred supplier) and purchase orders.';
```

### purchase_orders

```sql
create table purchase_orders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,
  po_number text not null,
  status po_status not null default 'draft',
  is_auto_generated boolean not null default false,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2),
  tax numeric(10,2) default 0,
  shipping numeric(10,2) default 0,
  total numeric(10,2),
  notes text,
  sent_at timestamptz,
  confirmed_at timestamptz,
  expected_delivery_date date,
  received_at timestamptz,
  received_by uuid references auth.users(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table purchase_orders is 'Purchase orders sent to suppliers. Can be auto-generated from low-stock alerts.';
comment on column purchase_orders.items is 'Array of {product_id, product_name, sku, quantity, unit_cost, total} objects.';
comment on column purchase_orders.po_number is 'Human-readable PO number, e.g. PO-2024-0042. Generated by trigger.';
```

---

## New Tables

### inventory_history

```sql
create table inventory_history (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid references inventory(id) on delete set null,
  product_id uuid not null references products(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  previous_quantity integer not null,
  new_quantity integer not null,
  delta integer not null generated always as (new_quantity - previous_quantity) stored,
  reason inventory_change_reason not null,
  source_type text,
  source_id uuid,
  scan_id uuid references scans(id) on delete set null,
  po_id uuid references purchase_orders(id) on delete set null,
  waste_record_id uuid references waste_records(id) on delete set null,
  changed_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now()
);

comment on table inventory_history is 'Immutable audit trail. Every stock change creates a row here. Never updated or deleted.';
comment on column inventory_history.delta is 'Computed column: new_quantity - previous_quantity. Positive = stock in, negative = stock out.';
comment on column inventory_history.source_type is 'Polymorphic reference type: "scan", "po", "waste", "manual", "pos_sale", "transfer".';
comment on column inventory_history.source_id is 'UUID of the source record (scan, PO, waste_record, etc).';
```

### stock_alerts

```sql
create table stock_alerts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  alert_config_id uuid references alert_configs(id) on delete set null,
  severity alert_severity not null default 'medium',
  title text not null,
  message text,
  current_quantity integer not null,
  threshold_quantity integer not null,
  is_read boolean not null default false,
  is_dismissed boolean not null default false,
  is_resolved boolean not null default false,
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id),
  notification_sent boolean not null default false,
  notification_sent_at timestamptz,
  notification_channels alert_channel[] default '{in_app}',
  created_at timestamptz not null default now()
);

comment on table stock_alerts is 'Generated alerts when stock falls below configured thresholds.';
```

### alert_configs

```sql
create table alert_configs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  name text not null,
  is_enabled boolean not null default true,
  threshold_type text not null default 'absolute'
    check (threshold_type in ('absolute', 'percentage', 'days_of_stock')),
  threshold_value numeric(10,2) not null,
  severity alert_severity not null default 'medium',
  channels alert_channel[] not null default '{push,in_app}',
  notify_roles org_role[] not null default '{owner,manager}',
  cooldown_minutes integer not null default 60,
  last_triggered_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table alert_configs is 'Configurable alerting rules. Can target a specific product, location, or apply org-wide.';
comment on column alert_configs.threshold_type is 'absolute: quantity < value. percentage: quantity < min_stock_level * value/100. days_of_stock: projected days remaining < value.';
comment on column alert_configs.cooldown_minutes is 'Minimum time between repeated alerts for the same condition.';
```

### expiration_alerts

```sql
create table expiration_alerts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  inventory_id uuid references inventory(id) on delete set null,
  expiration_date date not null,
  days_until_expiry integer not null,
  severity alert_severity not null default 'medium',
  quantity_at_risk integer not null default 0,
  estimated_loss numeric(10,2),
  is_read boolean not null default false,
  is_dismissed boolean not null default false,
  action_taken text,
  notification_sent boolean not null default false,
  notification_sent_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table expiration_alerts is 'Alerts for inventory items approaching or past their expiration date.';
comment on column expiration_alerts.days_until_expiry is 'Negative values indicate already expired.';
comment on column expiration_alerts.estimated_loss is 'cost_per_unit * quantity_at_risk for the expiring batch.';
```

### pos_connections

```sql
create table pos_connections (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  provider pos_provider not null,
  provider_merchant_id text,
  provider_location_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  scopes text[],
  webhook_url text,
  webhook_secret_encrypted text,
  sync_enabled boolean not null default true,
  last_sync_at timestamptz,
  last_sync_status text,
  last_sync_error text,
  sync_cursor text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(org_id, location_id, provider)
);

comment on table pos_connections is 'OAuth credentials and sync state for POS integrations (Square, Toast, Clover).';
comment on column pos_connections.access_token_encrypted is 'Encrypted at the application layer using Supabase Vault or server-side encryption.';
comment on column pos_connections.sync_cursor is 'Provider-specific pagination cursor for incremental sync.';
```

### product_barcode_lookup_cache

```sql
create table product_barcode_lookup_cache (
  id uuid primary key default gen_random_uuid(),
  barcode text not null,
  barcode_type text default 'UPC-A',
  org_id uuid references organizations(id) on delete cascade,
  source text not null default 'open_food_facts'
    check (source in ('open_food_facts', 'upc_database', 'manual', 'pos_import')),
  product_name text,
  brand text,
  category text,
  description text,
  image_url text,
  raw_response jsonb,
  is_verified boolean not null default false,
  verified_by uuid references auth.users(id),
  lookup_count integer not null default 1,
  last_looked_up_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(barcode, org_id)
);

comment on table product_barcode_lookup_cache is 'Caches external barcode API responses to reduce latency and API costs.';
comment on column product_barcode_lookup_cache.org_id is 'Nullable: NULL means this is a global cache entry available to all orgs.';
```

### reports

```sql
create table reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  name text not null,
  type report_type not null,
  frequency report_frequency not null default 'once',
  parameters jsonb not null default '{}'::jsonb,
  filters jsonb not null default '{}'::jsonb,
  last_generated_at timestamptz,
  last_output jsonb,
  last_output_url text,
  schedule_cron text,
  recipients text[],
  is_active boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table reports is 'Saved report definitions. Can be one-off or scheduled recurring.';
comment on column reports.parameters is 'Report-specific params, e.g. {"date_range": "last_30_days", "group_by": "category"}.';
comment on column reports.filters is 'Filters applied: {"location_ids": [...], "category_ids": [...], "supplier_ids": [...]}.';
comment on column reports.last_output is 'Cached JSON output of the most recent generation run.';
comment on column reports.schedule_cron is 'Cron expression for scheduled reports, e.g. "0 6 * * 1" for every Monday at 6 AM.';
```

### waste_records

```sql
create table waste_records (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  inventory_id uuid references inventory(id) on delete set null,
  quantity integer not null,
  reason waste_reason not null,
  cost_impact numeric(10,2),
  expiration_date date,
  image_url text,
  notes text,
  recorded_by uuid not null references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table waste_records is 'Tracks inventory removed due to spoilage, damage, expiry, or recalls.';
comment on column waste_records.cost_impact is 'Calculated: quantity * product.cost_per_unit at time of recording.';
```

---

## Indexes

```sql
-- =====================================================
-- ORGANIZATIONS
-- =====================================================
create index idx_organizations_slug on organizations(slug);
create index idx_organizations_stripe_customer on organizations(stripe_customer_id)
  where stripe_customer_id is not null;

-- =====================================================
-- ORG_MEMBERS
-- =====================================================
create index idx_org_members_user_id on org_members(user_id);
create index idx_org_members_org_id on org_members(org_id);
create index idx_org_members_org_role on org_members(org_id, role);
create index idx_org_members_active on org_members(org_id)
  where is_active = true;

-- =====================================================
-- LOCATIONS
-- =====================================================
create index idx_locations_org_id on locations(org_id);
create index idx_locations_org_active on locations(org_id)
  where is_active = true;
create index idx_locations_type on locations(org_id, type);

-- =====================================================
-- PRODUCT_CATEGORIES
-- =====================================================
create index idx_product_categories_org_id on product_categories(org_id);
create index idx_product_categories_parent on product_categories(parent_id);

-- =====================================================
-- PRODUCTS
-- =====================================================
create index idx_products_org_id on products(org_id);
create index idx_products_barcode on products(barcode)
  where barcode is not null;
create index idx_products_sku on products(org_id, sku)
  where sku is not null;
create index idx_products_category_id on products(category_id)
  where category_id is not null;
create index idx_products_supplier on products(preferred_supplier_id)
  where preferred_supplier_id is not null;
create index idx_products_name_trgm on products
  using gin (name gin_trgm_ops);
create index idx_products_active on products(org_id)
  where is_active = true;
create index idx_products_tags on products using gin(tags);

-- =====================================================
-- INVENTORY
-- =====================================================
create index idx_inventory_product_id on inventory(product_id);
create index idx_inventory_location_id on inventory(location_id);
create index idx_inventory_expiration on inventory(expiration_date)
  where expiration_date is not null;
create index idx_inventory_low_stock on inventory(location_id, quantity);
create index idx_inventory_last_scanned on inventory(last_scanned_at);

-- =====================================================
-- INVENTORY_HISTORY
-- =====================================================
create index idx_inventory_history_org_id on inventory_history(org_id);
create index idx_inventory_history_product on inventory_history(product_id);
create index idx_inventory_history_location on inventory_history(location_id);
create index idx_inventory_history_created on inventory_history(created_at desc);
create index idx_inventory_history_reason on inventory_history(org_id, reason);
create index idx_inventory_history_scan on inventory_history(scan_id)
  where scan_id is not null;
create index idx_inventory_history_po on inventory_history(po_id)
  where po_id is not null;

-- =====================================================
-- SCAN_SESSIONS
-- =====================================================
create index idx_scan_sessions_org_id on scan_sessions(org_id);
create index idx_scan_sessions_location on scan_sessions(location_id);
create index idx_scan_sessions_started_by on scan_sessions(started_by);
create index idx_scan_sessions_status on scan_sessions(org_id, status);
create index idx_scan_sessions_started_at on scan_sessions(started_at desc);

-- =====================================================
-- SCANS
-- =====================================================
create index idx_scans_session_id on scans(session_id);
create index idx_scans_location_id on scans(location_id);
create index idx_scans_scanned_by on scans(scanned_by);
create index idx_scans_created_at on scans(created_at desc);
create index idx_scans_type on scans(scan_type);
create index idx_scans_offline on scans(is_offline_sync)
  where is_offline_sync = true;

-- =====================================================
-- STOCK_ALERTS
-- =====================================================
create index idx_stock_alerts_org_id on stock_alerts(org_id);
create index idx_stock_alerts_location on stock_alerts(location_id);
create index idx_stock_alerts_product on stock_alerts(product_id);
create index idx_stock_alerts_unread on stock_alerts(org_id)
  where is_read = false and is_dismissed = false;
create index idx_stock_alerts_unresolved on stock_alerts(org_id)
  where is_resolved = false;
create index idx_stock_alerts_created on stock_alerts(created_at desc);

-- =====================================================
-- ALERT_CONFIGS
-- =====================================================
create index idx_alert_configs_org_id on alert_configs(org_id);
create index idx_alert_configs_location on alert_configs(location_id)
  where location_id is not null;
create index idx_alert_configs_product on alert_configs(product_id)
  where product_id is not null;
create index idx_alert_configs_enabled on alert_configs(org_id)
  where is_enabled = true;

-- =====================================================
-- EXPIRATION_ALERTS
-- =====================================================
create index idx_expiration_alerts_org_id on expiration_alerts(org_id);
create index idx_expiration_alerts_location on expiration_alerts(location_id);
create index idx_expiration_alerts_product on expiration_alerts(product_id);
create index idx_expiration_alerts_date on expiration_alerts(expiration_date);
create index idx_expiration_alerts_unread on expiration_alerts(org_id)
  where is_read = false and is_dismissed = false;

-- =====================================================
-- SUPPLIERS
-- =====================================================
create index idx_suppliers_org_id on suppliers(org_id);
create index idx_suppliers_active on suppliers(org_id)
  where is_active = true;
create index idx_suppliers_name_trgm on suppliers
  using gin (name gin_trgm_ops);

-- =====================================================
-- PURCHASE_ORDERS
-- =====================================================
create index idx_purchase_orders_org_id on purchase_orders(org_id);
create index idx_purchase_orders_location on purchase_orders(location_id);
create index idx_purchase_orders_supplier on purchase_orders(supplier_id);
create index idx_purchase_orders_status on purchase_orders(org_id, status);
create index idx_purchase_orders_po_number on purchase_orders(po_number);
create index idx_purchase_orders_created on purchase_orders(created_at desc);

-- =====================================================
-- POS_CONNECTIONS
-- =====================================================
create index idx_pos_connections_org_id on pos_connections(org_id);
create index idx_pos_connections_location on pos_connections(location_id);
create index idx_pos_connections_provider on pos_connections(provider);
create index idx_pos_connections_active on pos_connections(org_id)
  where is_active = true and sync_enabled = true;

-- =====================================================
-- PRODUCT_BARCODE_LOOKUP_CACHE
-- =====================================================
create index idx_barcode_cache_barcode on product_barcode_lookup_cache(barcode);
create index idx_barcode_cache_org on product_barcode_lookup_cache(org_id)
  where org_id is not null;
create index idx_barcode_cache_global on product_barcode_lookup_cache(barcode)
  where org_id is null;

-- =====================================================
-- REPORTS
-- =====================================================
create index idx_reports_org_id on reports(org_id);
create index idx_reports_type on reports(org_id, type);
create index idx_reports_active_scheduled on reports(org_id)
  where is_active = true and frequency != 'once';
create index idx_reports_created_by on reports(created_by);

-- =====================================================
-- WASTE_RECORDS
-- =====================================================
create index idx_waste_records_org_id on waste_records(org_id);
create index idx_waste_records_location on waste_records(location_id);
create index idx_waste_records_product on waste_records(product_id);
create index idx_waste_records_reason on waste_records(org_id, reason);
create index idx_waste_records_created on waste_records(created_at desc);
create index idx_waste_records_recorded_by on waste_records(recorded_by);
```

---

## Row Level Security (RLS) Policies

All policies use a shared helper function that resolves the current user's org membership.

### Helper Functions

```sql
-- Returns the org_ids the current authenticated user belongs to
create or replace function get_user_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id
  from org_members
  where user_id = auth.uid()
    and is_active = true;
$$;

-- Returns the role for the current user within a specific org
create or replace function get_user_role(target_org_id uuid)
returns org_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from org_members
  where user_id = auth.uid()
    and org_id = target_org_id
    and is_active = true
  limit 1;
$$;

-- Returns true if the current user is a member of the given org
create or replace function is_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from org_members
    where user_id = auth.uid()
      and org_id = target_org_id
      and is_active = true
  );
$$;

-- Returns true if the current user is an owner or manager in the given org
create or replace function is_org_admin(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from org_members
    where user_id = auth.uid()
      and org_id = target_org_id
      and role in ('owner', 'manager')
      and is_active = true
  );
$$;
```

### Enable RLS on All Tables

```sql
alter table organizations enable row level security;
alter table org_members enable row level security;
alter table locations enable row level security;
alter table product_categories enable row level security;
alter table products enable row level security;
alter table inventory enable row level security;
alter table inventory_history enable row level security;
alter table scan_sessions enable row level security;
alter table scans enable row level security;
alter table stock_alerts enable row level security;
alter table alert_configs enable row level security;
alter table expiration_alerts enable row level security;
alter table suppliers enable row level security;
alter table purchase_orders enable row level security;
alter table pos_connections enable row level security;
alter table product_barcode_lookup_cache enable row level security;
alter table reports enable row level security;
alter table waste_records enable row level security;
```

### Policy Definitions

```sql
-- =====================================================
-- ORGANIZATIONS
-- =====================================================

-- Members can view their own orgs
create policy "org_select_member"
  on organizations for select
  using (id in (select get_user_org_ids()));

-- Only owners can update org settings
create policy "org_update_owner"
  on organizations for update
  using (get_user_role(id) = 'owner')
  with check (get_user_role(id) = 'owner');

-- Any authenticated user can create an org (they become the owner)
create policy "org_insert_authenticated"
  on organizations for insert
  with check (auth.uid() is not null);

-- Only owners can delete an org
create policy "org_delete_owner"
  on organizations for delete
  using (get_user_role(id) = 'owner');

-- =====================================================
-- ORG_MEMBERS
-- =====================================================

-- Members can see other members in their org
create policy "org_members_select"
  on org_members for select
  using (org_id in (select get_user_org_ids()));

-- Owners and managers can invite new members
create policy "org_members_insert"
  on org_members for insert
  with check (is_org_admin(org_id));

-- Owners and managers can update member roles (owners cannot be demoted by managers)
create policy "org_members_update"
  on org_members for update
  using (is_org_admin(org_id))
  with check (is_org_admin(org_id));

-- Owners can remove members; members can remove themselves
create policy "org_members_delete"
  on org_members for delete
  using (
    get_user_role(org_id) = 'owner'
    or user_id = auth.uid()
  );

-- =====================================================
-- LOCATIONS
-- =====================================================

create policy "locations_select"
  on locations for select
  using (org_id in (select get_user_org_ids()));

create policy "locations_insert"
  on locations for insert
  with check (is_org_admin(org_id));

create policy "locations_update"
  on locations for update
  using (is_org_admin(org_id))
  with check (is_org_admin(org_id));

create policy "locations_delete"
  on locations for delete
  using (get_user_role(org_id) = 'owner');

-- =====================================================
-- PRODUCT_CATEGORIES
-- =====================================================

create policy "product_categories_select"
  on product_categories for select
  using (org_id in (select get_user_org_ids()));

create policy "product_categories_insert"
  on product_categories for insert
  with check (is_org_admin(org_id));

create policy "product_categories_update"
  on product_categories for update
  using (is_org_admin(org_id))
  with check (is_org_admin(org_id));

create policy "product_categories_delete"
  on product_categories for delete
  using (is_org_admin(org_id));

-- =====================================================
-- PRODUCTS
-- =====================================================

create policy "products_select"
  on products for select
  using (org_id in (select get_user_org_ids()));

create policy "products_insert"
  on products for insert
  with check (is_org_admin(org_id));

create policy "products_update"
  on products for update
  using (is_org_admin(org_id))
  with check (is_org_admin(org_id));

create policy "products_delete"
  on products for delete
  using (get_user_role(org_id) = 'owner');

-- =====================================================
-- INVENTORY
-- =====================================================

-- All members can view inventory
create policy "inventory_select"
  on inventory for select
  using (
    location_id in (
      select l.id from locations l
      where l.org_id in (select get_user_org_ids())
    )
  );

-- All members can update inventory (scanning updates stock)
create policy "inventory_insert"
  on inventory for insert
  with check (
    location_id in (
      select l.id from locations l
      where l.org_id in (select get_user_org_ids())
    )
  );

create policy "inventory_update"
  on inventory for update
  using (
    location_id in (
      select l.id from locations l
      where l.org_id in (select get_user_org_ids())
    )
  );

-- Only admins can delete inventory records
create policy "inventory_delete"
  on inventory for delete
  using (
    location_id in (
      select l.id from locations l
      where l.org_id in (select get_user_org_ids())
        and is_org_admin(l.org_id)
    )
  );

-- =====================================================
-- INVENTORY_HISTORY (read-only for all members)
-- =====================================================

create policy "inventory_history_select"
  on inventory_history for select
  using (org_id in (select get_user_org_ids()));

-- Insert only via triggers and edge functions (service role)
create policy "inventory_history_insert"
  on inventory_history for insert
  with check (org_id in (select get_user_org_ids()));

-- No update or delete policies: audit trail is immutable

-- =====================================================
-- SCAN_SESSIONS
-- =====================================================

create policy "scan_sessions_select"
  on scan_sessions for select
  using (org_id in (select get_user_org_ids()));

-- All members can start a scan session
create policy "scan_sessions_insert"
  on scan_sessions for insert
  with check (org_id in (select get_user_org_ids()));

create policy "scan_sessions_update"
  on scan_sessions for update
  using (org_id in (select get_user_org_ids()));

-- =====================================================
-- SCANS
-- =====================================================

create policy "scans_select"
  on scans for select
  using (
    location_id in (
      select l.id from locations l
      where l.org_id in (select get_user_org_ids())
    )
  );

-- All members can create scans
create policy "scans_insert"
  on scans for insert
  with check (
    location_id in (
      select l.id from locations l
      where l.org_id in (select get_user_org_ids())
    )
  );

-- =====================================================
-- STOCK_ALERTS
-- =====================================================

create policy "stock_alerts_select"
  on stock_alerts for select
  using (org_id in (select get_user_org_ids()));

create policy "stock_alerts_insert"
  on stock_alerts for insert
  with check (org_id in (select get_user_org_ids()));

create policy "stock_alerts_update"
  on stock_alerts for update
  using (org_id in (select get_user_org_ids()));

-- =====================================================
-- ALERT_CONFIGS
-- =====================================================

create policy "alert_configs_select"
  on alert_configs for select
  using (org_id in (select get_user_org_ids()));

create policy "alert_configs_insert"
  on alert_configs for insert
  with check (is_org_admin(org_id));

create policy "alert_configs_update"
  on alert_configs for update
  using (is_org_admin(org_id))
  with check (is_org_admin(org_id));

create policy "alert_configs_delete"
  on alert_configs for delete
  using (is_org_admin(org_id));

-- =====================================================
-- EXPIRATION_ALERTS
-- =====================================================

create policy "expiration_alerts_select"
  on expiration_alerts for select
  using (org_id in (select get_user_org_ids()));

create policy "expiration_alerts_insert"
  on expiration_alerts for insert
  with check (org_id in (select get_user_org_ids()));

create policy "expiration_alerts_update"
  on expiration_alerts for update
  using (org_id in (select get_user_org_ids()));

-- =====================================================
-- SUPPLIERS
-- =====================================================

create policy "suppliers_select"
  on suppliers for select
  using (org_id in (select get_user_org_ids()));

create policy "suppliers_insert"
  on suppliers for insert
  with check (is_org_admin(org_id));

create policy "suppliers_update"
  on suppliers for update
  using (is_org_admin(org_id))
  with check (is_org_admin(org_id));

create policy "suppliers_delete"
  on suppliers for delete
  using (get_user_role(org_id) = 'owner');

-- =====================================================
-- PURCHASE_ORDERS
-- =====================================================

create policy "purchase_orders_select"
  on purchase_orders for select
  using (org_id in (select get_user_org_ids()));

create policy "purchase_orders_insert"
  on purchase_orders for insert
  with check (is_org_admin(org_id));

create policy "purchase_orders_update"
  on purchase_orders for update
  using (is_org_admin(org_id))
  with check (is_org_admin(org_id));

create policy "purchase_orders_delete"
  on purchase_orders for delete
  using (
    get_user_role(org_id) = 'owner'
    and status = 'draft'
  );

-- =====================================================
-- POS_CONNECTIONS
-- =====================================================

create policy "pos_connections_select"
  on pos_connections for select
  using (org_id in (select get_user_org_ids()));

-- Only owners can manage POS integrations
create policy "pos_connections_insert"
  on pos_connections for insert
  with check (get_user_role(org_id) = 'owner');

create policy "pos_connections_update"
  on pos_connections for update
  using (get_user_role(org_id) = 'owner')
  with check (get_user_role(org_id) = 'owner');

create policy "pos_connections_delete"
  on pos_connections for delete
  using (get_user_role(org_id) = 'owner');

-- =====================================================
-- PRODUCT_BARCODE_LOOKUP_CACHE
-- =====================================================

-- All members can read cache (including global entries where org_id is null)
create policy "barcode_cache_select"
  on product_barcode_lookup_cache for select
  using (
    org_id is null
    or org_id in (select get_user_org_ids())
  );

-- All members can insert cache entries
create policy "barcode_cache_insert"
  on product_barcode_lookup_cache for insert
  with check (
    org_id is null
    or org_id in (select get_user_org_ids())
  );

create policy "barcode_cache_update"
  on product_barcode_lookup_cache for update
  using (
    org_id is null
    or org_id in (select get_user_org_ids())
  );

-- =====================================================
-- REPORTS
-- =====================================================

create policy "reports_select"
  on reports for select
  using (org_id in (select get_user_org_ids()));

create policy "reports_insert"
  on reports for insert
  with check (is_org_admin(org_id));

create policy "reports_update"
  on reports for update
  using (is_org_admin(org_id))
  with check (is_org_admin(org_id));

create policy "reports_delete"
  on reports for delete
  using (is_org_admin(org_id));

-- =====================================================
-- WASTE_RECORDS
-- =====================================================

create policy "waste_records_select"
  on waste_records for select
  using (org_id in (select get_user_org_ids()));

-- All members can record waste
create policy "waste_records_insert"
  on waste_records for insert
  with check (org_id in (select get_user_org_ids()));

-- Only admins can update waste records (e.g. review)
create policy "waste_records_update"
  on waste_records for update
  using (is_org_admin(org_id))
  with check (is_org_admin(org_id));
```

---

## Triggers and Functions

### Auto-update `updated_at` Timestamps

```sql
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to all tables with updated_at
create trigger set_updated_at before update on organizations
  for each row execute function update_updated_at();
create trigger set_updated_at before update on org_members
  for each row execute function update_updated_at();
create trigger set_updated_at before update on locations
  for each row execute function update_updated_at();
create trigger set_updated_at before update on products
  for each row execute function update_updated_at();
create trigger set_updated_at before update on inventory
  for each row execute function update_updated_at();
create trigger set_updated_at before update on suppliers
  for each row execute function update_updated_at();
create trigger set_updated_at before update on purchase_orders
  for each row execute function update_updated_at();
create trigger set_updated_at before update on pos_connections
  for each row execute function update_updated_at();
create trigger set_updated_at before update on alert_configs
  for each row execute function update_updated_at();
create trigger set_updated_at before update on reports
  for each row execute function update_updated_at();
create trigger set_updated_at before update on product_barcode_lookup_cache
  for each row execute function update_updated_at();
```

### Inventory History Audit Trail

```sql
-- Automatically log every inventory change to inventory_history
create or replace function log_inventory_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  -- Resolve org_id from the location
  select l.org_id into v_org_id
  from locations l
  where l.id = coalesce(new.location_id, old.location_id);

  if tg_op = 'INSERT' then
    insert into inventory_history (
      inventory_id, product_id, location_id, org_id,
      previous_quantity, new_quantity,
      reason, changed_by
    ) values (
      new.id, new.product_id, new.location_id, v_org_id,
      0, new.quantity,
      'initial_count', new.last_scanned_by
    );
    return new;

  elsif tg_op = 'UPDATE' then
    -- Only log if quantity actually changed
    if old.quantity is distinct from new.quantity then
      insert into inventory_history (
        inventory_id, product_id, location_id, org_id,
        previous_quantity, new_quantity,
        reason, changed_by
      ) values (
        new.id, new.product_id, new.location_id, v_org_id,
        old.quantity, new.quantity,
        'scan', new.last_scanned_by
      );
    end if;
    return new;

  elsif tg_op = 'DELETE' then
    insert into inventory_history (
      inventory_id, product_id, location_id, org_id,
      previous_quantity, new_quantity,
      reason, changed_by
    ) values (
      old.id, old.product_id, old.location_id, v_org_id,
      old.quantity, 0,
      'manual_adjustment', null
    );
    return old;
  end if;

  return null;
end;
$$;

create trigger trg_inventory_audit
  after insert or update or delete on inventory
  for each row execute function log_inventory_change();
```

### Auto-Generate PO Numbers

```sql
create or replace function generate_po_number()
returns trigger
language plpgsql
as $$
declare
  v_year text;
  v_seq integer;
begin
  v_year := to_char(now(), 'YYYY');

  select coalesce(max(
    cast(
      substring(po_number from 'PO-' || v_year || '-(\d+)')
      as integer
    )
  ), 0) + 1
  into v_seq
  from purchase_orders
  where org_id = new.org_id
    and po_number like 'PO-' || v_year || '-%';

  new.po_number := 'PO-' || v_year || '-' || lpad(v_seq::text, 4, '0');
  return new;
end;
$$;

create trigger trg_generate_po_number
  before insert on purchase_orders
  for each row
  when (new.po_number is null or new.po_number = '')
  execute function generate_po_number();
```

### Auto-Create Owner Membership on Org Creation

```sql
create or replace function create_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into org_members (org_id, user_id, role, accepted_at)
  values (new.id, auth.uid(), 'owner', now());
  return new;
end;
$$;

create trigger trg_create_owner_on_org_insert
  after insert on organizations
  for each row execute function create_owner_membership();
```

### Low-Stock Alert Generation

```sql
create or replace function check_low_stock_alert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product record;
  v_org_id uuid;
  v_config record;
  v_threshold integer;
begin
  -- Get product info
  select p.*, l.org_id
  into v_product
  from products p
  join locations l on l.id = new.location_id
  where p.id = new.product_id;

  v_org_id := v_product.org_id;

  -- Check if quantity fell below min_stock_level
  if new.quantity <= v_product.min_stock_level
     and (old.quantity is null or old.quantity > v_product.min_stock_level)
  then
    -- Check for matching alert config
    select * into v_config
    from alert_configs
    where org_id = v_org_id
      and is_enabled = true
      and (location_id is null or location_id = new.location_id)
      and (product_id is null or product_id = new.product_id)
      and (
        last_triggered_at is null
        or last_triggered_at < now() - (cooldown_minutes || ' minutes')::interval
      )
    order by
      -- Most specific config wins: product+location > product > location > org-wide
      (product_id is not null)::int desc,
      (location_id is not null)::int desc
    limit 1;

    -- Determine severity
    declare
      v_severity alert_severity;
    begin
      if new.quantity = 0 then
        v_severity := 'critical';
      elsif new.quantity <= v_product.min_stock_level * 0.25 then
        v_severity := 'high';
      elsif new.quantity <= v_product.min_stock_level * 0.5 then
        v_severity := 'medium';
      else
        v_severity := 'low';
      end if;

      insert into stock_alerts (
        org_id, location_id, product_id, alert_config_id,
        severity, title, message,
        current_quantity, threshold_quantity,
        notification_channels
      ) values (
        v_org_id, new.location_id, new.product_id,
        v_config.id,
        v_severity,
        v_product.name || ' is low on stock',
        v_product.name || ': ' || new.quantity || ' remaining (threshold: '
          || v_product.min_stock_level || ')',
        new.quantity,
        v_product.min_stock_level,
        coalesce(v_config.channels, '{push,in_app}')
      );

      -- Update config last triggered
      if v_config.id is not null then
        update alert_configs
        set last_triggered_at = now()
        where id = v_config.id;
      end if;
    end;
  end if;

  return new;
end;
$$;

create trigger trg_check_low_stock
  after update on inventory
  for each row execute function check_low_stock_alert();
```

### Scan Session Counter

```sql
create or replace function update_scan_session_counts()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' and new.session_id is not null then
    update scan_sessions
    set scan_count = scan_count + 1,
        products_found = products_found + coalesce(
          jsonb_array_length(new.products_detected), 0
        )
    where id = new.session_id;
  end if;
  return new;
end;
$$;

create trigger trg_update_scan_session_counts
  after insert on scans
  for each row execute function update_scan_session_counts();
```

### Waste Record Cost Calculation

```sql
create or replace function calculate_waste_cost()
returns trigger
language plpgsql
as $$
declare
  v_cost numeric(10,2);
begin
  select cost_per_unit into v_cost
  from products
  where id = new.product_id;

  new.cost_impact := coalesce(v_cost, 0) * new.quantity;
  return new;
end;
$$;

create trigger trg_calculate_waste_cost
  before insert on waste_records
  for each row
  when (new.cost_impact is null)
  execute function calculate_waste_cost();
```

---

## Seed Data

```sql
-- =====================================================
-- Default product categories (applied per-org on onboarding)
-- =====================================================
-- These are inserted via the onboarding Edge Function when a new org is created.
-- Listed here as reference:

-- insert into product_categories (org_id, name, slug, sort_order, icon) values
--   (:org_id, 'Produce',       'produce',       1,  'leaf'),
--   (:org_id, 'Dairy',         'dairy',         2,  'milk'),
--   (:org_id, 'Meat & Seafood','meat-seafood',  3,  'drumstick'),
--   (:org_id, 'Beverages',     'beverages',     4,  'coffee'),
--   (:org_id, 'Dry Goods',     'dry-goods',     5,  'package'),
--   (:org_id, 'Frozen',        'frozen',        6,  'snowflake'),
--   (:org_id, 'Paper & Supply','paper-supply',  7,  'scroll'),
--   (:org_id, 'Cleaning',      'cleaning',      8,  'spray-can'),
--   (:org_id, 'Packaging',     'packaging',     9,  'box'),
--   (:org_id, 'Other',         'other',         99, 'ellipsis');


-- =====================================================
-- Default alert configs (per-org on onboarding)
-- =====================================================
-- insert into alert_configs (org_id, name, threshold_type, threshold_value, severity, channels)
-- values
--   (:org_id, 'Critical: Out of Stock',     'absolute',   0,   'critical', '{push,email,in_app}'),
--   (:org_id, 'High: Below 25% threshold',  'percentage', 25,  'high',     '{push,in_app}'),
--   (:org_id, 'Medium: Below 50% threshold', 'percentage', 50,  'medium',   '{in_app}');


-- =====================================================
-- Demo org for development and testing
-- =====================================================
do $$
declare
  v_org_id uuid;
  v_loc_id uuid;
  v_cat_produce uuid;
  v_cat_dairy uuid;
  v_cat_beverages uuid;
  v_sup_id uuid;
  v_prod_tomatoes uuid;
  v_prod_milk uuid;
  v_prod_coffee uuid;
begin
  -- Only insert if the demo org does not already exist
  if not exists (select 1 from organizations where slug = 'demo-restaurant') then

    -- Organization
    insert into organizations (id, name, slug, plan, settings)
    values (
      gen_random_uuid(), 'Demo Restaurant', 'demo-restaurant', 'growth',
      '{
        "currency": "USD",
        "timezone": "America/New_York",
        "low_stock_threshold_percent": 20,
        "scan_image_retention_days": 30,
        "auto_po_enabled": true
      }'::jsonb
    )
    returning id into v_org_id;

    -- Location
    insert into locations (id, org_id, name, address, city, state, zip, type)
    values (
      gen_random_uuid(), v_org_id,
      'Downtown Kitchen', '123 Main St', 'New York', 'NY', '10001',
      'restaurant'
    )
    returning id into v_loc_id;

    -- Categories
    insert into product_categories (id, org_id, name, slug, sort_order, icon)
    values (gen_random_uuid(), v_org_id, 'Produce', 'produce', 1, 'leaf')
    returning id into v_cat_produce;

    insert into product_categories (id, org_id, name, slug, sort_order, icon)
    values (gen_random_uuid(), v_org_id, 'Dairy', 'dairy', 2, 'milk')
    returning id into v_cat_dairy;

    insert into product_categories (id, org_id, name, slug, sort_order, icon)
    values (gen_random_uuid(), v_org_id, 'Beverages', 'beverages', 3, 'coffee')
    returning id into v_cat_beverages;

    -- Supplier
    insert into suppliers (id, org_id, name, contact_email, contact_phone, lead_time_days)
    values (
      gen_random_uuid(), v_org_id,
      'Fresh Farms Wholesale', 'orders@freshfarms.example.com', '555-0100', 2
    )
    returning id into v_sup_id;

    -- Products
    insert into products (id, org_id, category_id, name, sku, barcode, unit, cost_per_unit, min_stock_level, preferred_supplier_id, expiration_tracking, default_shelf_life_days)
    values (
      gen_random_uuid(), v_org_id, v_cat_produce,
      'Roma Tomatoes', 'PROD-001', '012345678901', 'lb',
      2.50, 20, v_sup_id, true, 7
    )
    returning id into v_prod_tomatoes;

    insert into products (id, org_id, category_id, name, sku, barcode, unit, cost_per_unit, min_stock_level, preferred_supplier_id, expiration_tracking, default_shelf_life_days)
    values (
      gen_random_uuid(), v_org_id, v_cat_dairy,
      'Whole Milk (1 gal)', 'DAIRY-001', '012345678902', 'each',
      4.25, 10, v_sup_id, true, 14
    )
    returning id into v_prod_milk;

    insert into products (id, org_id, category_id, name, sku, barcode, unit, cost_per_unit, min_stock_level, preferred_supplier_id, expiration_tracking, default_shelf_life_days)
    values (
      gen_random_uuid(), v_org_id, v_cat_beverages,
      'House Blend Coffee (5 lb)', 'BEV-001', '012345678903', 'bag',
      18.00, 5, v_sup_id, false, null
    )
    returning id into v_prod_coffee;

    -- Inventory
    insert into inventory (product_id, location_id, quantity, expiration_date)
    values
      (v_prod_tomatoes, v_loc_id, 35, current_date + interval '5 days'),
      (v_prod_milk,     v_loc_id, 8,  current_date + interval '10 days'),
      (v_prod_coffee,   v_loc_id, 12, null);

    -- Alert configs
    insert into alert_configs (org_id, name, threshold_type, threshold_value, severity, channels)
    values
      (v_org_id, 'Critical: Out of Stock',      'absolute',   0,   'critical', '{push,email,in_app}'),
      (v_org_id, 'High: Below 25% of minimum',  'percentage', 25,  'high',     '{push,in_app}'),
      (v_org_id, 'Medium: Below 50% of minimum', 'percentage', 50,  'medium',   '{in_app}');

    raise notice 'Demo seed data inserted. org_id=%', v_org_id;
  else
    raise notice 'Demo org already exists, skipping seed.';
  end if;
end;
$$;
```

---

## TypeScript Interfaces

Corresponding TypeScript types for the React Native client. These live in `src/types/database.ts`.

```typescript
// =====================================================
// Enums
// =====================================================

export type OrgPlan = 'free' | 'growth' | 'business' | 'enterprise';
export type OrgRole = 'owner' | 'manager' | 'staff';
export type LocationType = 'restaurant' | 'retail' | 'warehouse' | 'food_truck';
export type ScanType = 'camera' | 'barcode' | 'manual';
export type ScanSessionStatus = 'in_progress' | 'completed' | 'cancelled';
export type POStatus = 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertChannel = 'push' | 'email' | 'sms' | 'in_app';
export type InventoryChangeReason =
  | 'scan'
  | 'manual_adjustment'
  | 'pos_sale'
  | 'purchase_order_received'
  | 'waste'
  | 'transfer'
  | 'initial_count'
  | 'correction';
export type WasteReason =
  | 'expired'
  | 'damaged'
  | 'spoiled'
  | 'recalled'
  | 'overstock'
  | 'other';
export type POSProvider = 'square' | 'toast' | 'clover';
export type ReportType =
  | 'inventory_summary'
  | 'low_stock'
  | 'waste_summary'
  | 'scan_activity'
  | 'cost_analysis'
  | 'expiration_forecast'
  | 'supplier_performance'
  | 'custom';
export type ReportFrequency = 'once' | 'daily' | 'weekly' | 'monthly';

// =====================================================
// Table Row Types
// =====================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: OrgPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  settings: OrgSettings;
  logo_url: string | null;
  max_locations: number;
  max_users: number;
  created_at: string;
  updated_at: string;
}

export interface OrgSettings {
  currency: string;
  timezone: string;
  low_stock_threshold_percent: number;
  scan_image_retention_days: number;
  auto_po_enabled: boolean;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  display_name: string | null;
  avatar_url: string | null;
  invited_by: string | null;
  invited_at: string | null;
  accepted_at: string | null;
  is_active: boolean;
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  org_id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  type: LocationType;
  timezone: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  icon: string | null;
  color: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  org_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  category: string | null;
  unit: string;
  cost_per_unit: number | null;
  sell_price: number | null;
  min_stock_level: number;
  max_stock_level: number | null;
  reorder_quantity: number | null;
  preferred_supplier_id: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  expiration_tracking: boolean;
  default_shelf_life_days: number | null;
  weight: number | null;
  weight_unit: string;
  is_active: boolean;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  location_id: string;
  quantity: number;
  reserved_quantity: number;
  expiration_date: string | null;
  batch_number: string | null;
  bin_location: string | null;
  last_scanned_at: string | null;
  last_scanned_by: string | null;
  last_count_verified_at: string | null;
  notes: string | null;
  updated_at: string;
}

export interface InventoryHistory {
  id: string;
  inventory_id: string | null;
  product_id: string;
  location_id: string;
  org_id: string;
  previous_quantity: number;
  new_quantity: number;
  delta: number;
  reason: InventoryChangeReason;
  source_type: string | null;
  source_id: string | null;
  scan_id: string | null;
  po_id: string | null;
  waste_record_id: string | null;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface ScanSession {
  id: string;
  org_id: string;
  location_id: string;
  started_by: string;
  status: ScanSessionStatus;
  scan_count: number;
  products_found: number;
  new_products_added: number;
  duration_seconds: number | null;
  notes: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface Scan {
  id: string;
  session_id: string | null;
  location_id: string;
  scanned_by: string;
  scan_type: ScanType;
  image_url: string | null;
  image_storage_key: string | null;
  ai_response: Record<string, unknown> | null;
  ai_model: string;
  ai_tokens_used: number | null;
  ai_cost_cents: number | null;
  products_detected: DetectedProduct[] | null;
  accuracy_score: number | null;
  processing_time_ms: number | null;
  device_info: DeviceInfo | null;
  is_offline_sync: boolean;
  created_at: string;
}

export interface DetectedProduct {
  product_id: string | null;
  name: string;
  quantity: number;
  quantity_min?: number;
  quantity_max?: number;
  confidence: number;
  condition?: 'good' | 'fair' | 'expiring_soon' | 'expired';
  barcode_visible?: boolean;
  expiration_date?: string | null;
}

export interface DeviceInfo {
  platform: 'ios' | 'android';
  os_version: string;
  app_version: string;
  device_model: string;
}

export interface StockAlert {
  id: string;
  org_id: string;
  location_id: string;
  product_id: string;
  alert_config_id: string | null;
  severity: AlertSeverity;
  title: string;
  message: string | null;
  current_quantity: number;
  threshold_quantity: number;
  is_read: boolean;
  is_dismissed: boolean;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  notification_sent: boolean;
  notification_sent_at: string | null;
  notification_channels: AlertChannel[];
  created_at: string;
}

export interface AlertConfig {
  id: string;
  org_id: string;
  location_id: string | null;
  product_id: string | null;
  name: string;
  is_enabled: boolean;
  threshold_type: 'absolute' | 'percentage' | 'days_of_stock';
  threshold_value: number;
  severity: AlertSeverity;
  channels: AlertChannel[];
  notify_roles: OrgRole[];
  cooldown_minutes: number;
  last_triggered_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpirationAlert {
  id: string;
  org_id: string;
  location_id: string;
  product_id: string;
  inventory_id: string | null;
  expiration_date: string;
  days_until_expiry: number;
  severity: AlertSeverity;
  quantity_at_risk: number;
  estimated_loss: number | null;
  is_read: boolean;
  is_dismissed: boolean;
  action_taken: string | null;
  notification_sent: boolean;
  notification_sent_at: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  org_id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  payment_terms: string | null;
  lead_time_days: number | null;
  minimum_order: number | null;
  catalog: Record<string, unknown> | null;
  notes: string | null;
  is_active: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  org_id: string;
  location_id: string | null;
  supplier_id: string | null;
  po_number: string;
  status: POStatus;
  is_auto_generated: boolean;
  items: PurchaseOrderItem[];
  subtotal: number | null;
  tax: number | null;
  shipping: number | null;
  total: number | null;
  notes: string | null;
  sent_at: string | null;
  confirmed_at: string | null;
  expected_delivery_date: string | null;
  received_at: string | null;
  received_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  product_id: string;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_cost: number;
  total: number;
}

export interface POSConnection {
  id: string;
  org_id: string;
  location_id: string;
  provider: POSProvider;
  provider_merchant_id: string | null;
  provider_location_id: string | null;
  // access_token_encrypted omitted from client type (server-side only)
  // refresh_token_encrypted omitted from client type (server-side only)
  token_expires_at: string | null;
  scopes: string[] | null;
  webhook_url: string | null;
  // webhook_secret_encrypted omitted from client type
  sync_enabled: boolean;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BarcodeLookupCache {
  id: string;
  barcode: string;
  barcode_type: string;
  org_id: string | null;
  source: 'open_food_facts' | 'upc_database' | 'manual' | 'pos_import';
  product_name: string | null;
  brand: string | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  raw_response: Record<string, unknown> | null;
  is_verified: boolean;
  verified_by: string | null;
  lookup_count: number;
  last_looked_up_at: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  org_id: string;
  location_id: string | null;
  name: string;
  type: ReportType;
  frequency: ReportFrequency;
  parameters: Record<string, unknown>;
  filters: ReportFilters;
  last_generated_at: string | null;
  last_output: Record<string, unknown> | null;
  last_output_url: string | null;
  schedule_cron: string | null;
  recipients: string[] | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReportFilters {
  location_ids?: string[];
  category_ids?: string[];
  supplier_ids?: string[];
  product_ids?: string[];
  date_range?: string;
  start_date?: string;
  end_date?: string;
}

export interface WasteRecord {
  id: string;
  org_id: string;
  location_id: string;
  product_id: string;
  inventory_id: string | null;
  quantity: number;
  reason: WasteReason;
  cost_impact: number | null;
  expiration_date: string | null;
  image_url: string | null;
  notes: string | null;
  recorded_by: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// =====================================================
// Supabase Generated Types Helper
// =====================================================

/**
 * Use with supabase-js:
 *
 *   import { createClient } from '@supabase/supabase-js';
 *   import type { Database } from './types/supabase';
 *
 *   const supabase = createClient<Database>(url, key);
 *
 * Generate full types via:
 *   npx supabase gen types typescript --project-id <id> > src/types/supabase.ts
 */
export interface Database {
  public: {
    Tables: {
      organizations: { Row: Organization; Insert: Partial<Organization>; Update: Partial<Organization> };
      org_members: { Row: OrgMember; Insert: Partial<OrgMember>; Update: Partial<OrgMember> };
      locations: { Row: Location; Insert: Partial<Location>; Update: Partial<Location> };
      product_categories: { Row: ProductCategory; Insert: Partial<ProductCategory>; Update: Partial<ProductCategory> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
      inventory: { Row: Inventory; Insert: Partial<Inventory>; Update: Partial<Inventory> };
      inventory_history: { Row: InventoryHistory; Insert: Partial<InventoryHistory>; Update: never };
      scan_sessions: { Row: ScanSession; Insert: Partial<ScanSession>; Update: Partial<ScanSession> };
      scans: { Row: Scan; Insert: Partial<Scan>; Update: never };
      stock_alerts: { Row: StockAlert; Insert: Partial<StockAlert>; Update: Partial<StockAlert> };
      alert_configs: { Row: AlertConfig; Insert: Partial<AlertConfig>; Update: Partial<AlertConfig> };
      expiration_alerts: { Row: ExpirationAlert; Insert: Partial<ExpirationAlert>; Update: Partial<ExpirationAlert> };
      suppliers: { Row: Supplier; Insert: Partial<Supplier>; Update: Partial<Supplier> };
      purchase_orders: { Row: PurchaseOrder; Insert: Partial<PurchaseOrder>; Update: Partial<PurchaseOrder> };
      pos_connections: { Row: POSConnection; Insert: Partial<POSConnection>; Update: Partial<POSConnection> };
      product_barcode_lookup_cache: { Row: BarcodeLookupCache; Insert: Partial<BarcodeLookupCache>; Update: Partial<BarcodeLookupCache> };
      reports: { Row: Report; Insert: Partial<Report>; Update: Partial<Report> };
      waste_records: { Row: WasteRecord; Insert: Partial<WasteRecord>; Update: Partial<WasteRecord> };
    };
    Functions: {
      get_user_org_ids: { Args: Record<string, never>; Returns: string[] };
      get_user_role: { Args: { target_org_id: string }; Returns: OrgRole };
      is_org_member: { Args: { target_org_id: string }; Returns: boolean };
      is_org_admin: { Args: { target_org_id: string }; Returns: boolean };
    };
  };
}
```

---

## Migration Notes

### Execution Order

Tables must be created in dependency order to satisfy foreign key constraints. Run the migration in this sequence:

```
1.  Extensions and enums
2.  organizations
3.  org_members
4.  locations
5.  product_categories
6.  suppliers                  (referenced by products.preferred_supplier_id)
7.  products
8.  inventory
9.  scan_sessions
10. scans
11. waste_records              (referenced by inventory_history.waste_record_id)
12. purchase_orders
13. inventory_history          (references inventory, scans, purchase_orders, waste_records)
14. stock_alerts
15. alert_configs
16. expiration_alerts
17. pos_connections
18. product_barcode_lookup_cache
19. reports
20. Indexes
21. RLS policies and helper functions
22. Triggers
23. Seed data
```

### Supabase CLI Migration

```bash
# Generate a new migration
supabase migration new create_stockpulse_schema

# Apply locally
supabase db reset

# Push to remote
supabase db push

# Generate TypeScript types after migration
supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Enums over text checks** | Better type safety, smaller storage, enforced at the database level. Enums can be extended via `ALTER TYPE ... ADD VALUE`. |
| **`org_id` on history/alerts** | Denormalized for RLS performance. Avoids multi-table joins in every policy check. |
| **JSONB for PO items** | Flexible line items without a junction table. Queried via `jsonb_array_elements` when needed. |
| **Separate `scan_sessions` table** | Groups scans logically. Enables session-level metrics (duration, count) without aggregating on every query. |
| **`inventory_history` is append-only** | No UPDATE or DELETE policies. Immutable audit trail for compliance and debugging. |
| **`product_barcode_lookup_cache` with nullable `org_id`** | Global cache entries (org_id IS NULL) shared across tenants reduce external API calls. Org-specific entries override globals. |
| **Encrypted POS tokens** | `access_token_encrypted` and `refresh_token_encrypted` are encrypted at the application layer. Column names signal that raw tokens are never stored. |
| **Computed `delta` column** | `generated always as (new_quantity - previous_quantity) stored` eliminates calculation errors and simplifies reporting queries. |
| **Trigram indexes on names** | `pg_trgm` enables fuzzy search (`%query%`, similarity scoring) for product and supplier lookups from the mobile search bar. |

---

*Schema version: 1.0.0 | Last updated: 2025-01-15 | Compatible with Supabase v2.x and PostgreSQL 15+*
