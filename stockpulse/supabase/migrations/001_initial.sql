-- ─────────────────────────────────────────────────────────────────────────────
-- StockPulse Initial Schema Migration
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Organizations ────────────────────────────────────────────────────────────

CREATE TABLE organizations (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         text NOT NULL,
  business_type text CHECK (business_type IN ('restaurant', 'retail', 'warehouse', 'other')),
  settings     jsonb DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── Org Members ─────────────────────────────────────────────────────────────

CREATE TABLE org_members (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'member'
              CHECK (role IN ('owner', 'admin', 'manager', 'member')),
  joined_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);

-- ─── Locations ────────────────────────────────────────────────────────────────

CREATE TABLE locations (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       text NOT NULL,
  address    text,
  timezone   text DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Product Categories ───────────────────────────────────────────────────────

CREATE TABLE product_categories (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       text NOT NULL,
  color      text NOT NULL DEFAULT '#059669',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);

-- Seed default categories (applied per org via trigger or application layer)

-- ─── Products ─────────────────────────────────────────────────────────────────

CREATE TABLE products (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        text NOT NULL,
  sku         text NOT NULL,
  category_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  brand       text,
  unit        text NOT NULL DEFAULT 'each'
              CHECK (unit IN ('each', 'kg', 'lbs', 'case', 'box', 'bottle', 'can', 'gallon', 'oz')),
  description text,
  image_url   text,
  barcode     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- SKU must be unique within an organization
  UNIQUE (org_id, sku)
);

-- ─── Inventory ────────────────────────────────────────────────────────────────

CREATE TABLE inventory (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id      uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  current_stock    numeric NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  reorder_point    numeric NOT NULL DEFAULT 10 CHECK (reorder_point >= 0),
  max_stock        numeric NOT NULL DEFAULT 100 CHECK (max_stock >= 0),
  cost_per_unit    numeric CHECK (cost_per_unit >= 0),
  last_counted_at  timestamptz,
  -- Each product can only have one inventory record per location
  UNIQUE (product_id, location_id)
);

-- ─── Scan Sessions ────────────────────────────────────────────────────────────

CREATE TABLE scan_sessions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id     uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  scanned_by      uuid NOT NULL REFERENCES auth.users(id),
  scan_type       text NOT NULL DEFAULT 'barcode'
                  CHECK (scan_type IN ('barcode', 'ai_vision', 'manual', 'count')),
  barcode         text,
  product_id      uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity_change numeric NOT NULL DEFAULT 0,
  notes           text,
  scanned_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Stock Alerts ─────────────────────────────────────────────────────────────

CREATE TABLE stock_alerts (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id  uuid NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  alert_type    text NOT NULL DEFAULT 'low_stock'
                CHECK (alert_type IN ('low_stock', 'out_of_stock', 'overstock', 'expiry')),
  severity      text NOT NULL DEFAULT 'low'
                CHECK (severity IN ('critical', 'low', 'info')),
  acknowledged  boolean NOT NULL DEFAULT false,
  acknowledged_by uuid REFERENCES auth.users(id),
  acknowledged_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Purchase Orders ──────────────────────────────────────────────────────────

CREATE TABLE purchase_orders (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id   uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'sent', 'confirmed', 'received', 'cancelled')),
  items         jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_by  uuid NOT NULL REFERENCES auth.users(id),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX idx_org_members_user       ON org_members(user_id);
CREATE INDEX idx_org_members_org        ON org_members(org_id);
CREATE INDEX idx_locations_org          ON locations(org_id);
CREATE INDEX idx_products_org           ON products(org_id);
CREATE INDEX idx_products_barcode       ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_products_sku           ON products(org_id, sku);
CREATE INDEX idx_products_category      ON products(category_id);
CREATE INDEX idx_inventory_product      ON inventory(product_id);
CREATE INDEX idx_inventory_location     ON inventory(location_id);
CREATE INDEX idx_scan_sessions_location ON scan_sessions(location_id);
CREATE INDEX idx_scan_sessions_product  ON scan_sessions(product_id);
CREATE INDEX idx_scan_sessions_time     ON scan_sessions(scanned_at DESC);
CREATE INDEX idx_stock_alerts_inventory ON stock_alerts(inventory_id);
CREATE INDEX idx_stock_alerts_severity  ON stock_alerts(severity, acknowledged);
CREATE INDEX idx_stock_alerts_open      ON stock_alerts(acknowledged) WHERE acknowledged = false;
CREATE INDEX idx_purchase_orders_org    ON purchase_orders(org_id);
CREATE INDEX idx_purchase_orders_loc    ON purchase_orders(location_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER: Auto-update inventory.current_stock after scan_sessions INSERT
-- Also inserts a stock_alert if stock drops to/below reorder_point
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_apply_scan_to_inventory()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_inventory   inventory%ROWTYPE;
  v_new_stock   numeric;
  v_alert_type  text;
  v_severity    text;
BEGIN
  -- Find the matching inventory record (product x location)
  SELECT *
  INTO v_inventory
  FROM inventory
  WHERE product_id   = NEW.product_id
    AND location_id  = NEW.location_id
  FOR UPDATE;

  IF NOT FOUND THEN
    -- No inventory record yet: auto-create with sensible defaults
    INSERT INTO inventory (product_id, location_id, current_stock, reorder_point, max_stock, last_counted_at)
    VALUES (NEW.product_id, NEW.location_id, GREATEST(0, NEW.quantity_change), 10, 100, NOW())
    RETURNING * INTO v_inventory;
  END IF;

  -- Compute new stock
  IF NEW.scan_type = 'count' THEN
    -- Absolute count: set directly
    v_new_stock := GREATEST(0, NEW.quantity_change);
  ELSE
    -- Relative delta: add (positive = restock, negative = depletion)
    v_new_stock := GREATEST(0, v_inventory.current_stock + NEW.quantity_change);
  END IF;

  -- Update inventory
  UPDATE inventory
  SET current_stock   = v_new_stock,
      last_counted_at = NEW.scanned_at
  WHERE id = v_inventory.id;

  -- ── Alert logic ────────────────────────────────────────────────────────────

  -- Only raise alerts when stock goes down
  IF v_new_stock < v_inventory.current_stock THEN

    IF v_new_stock <= 0 THEN
      v_alert_type := 'out_of_stock';
      v_severity   := 'critical';
    ELSIF v_new_stock <= v_inventory.reorder_point * 0.25 THEN
      v_alert_type := 'low_stock';
      v_severity   := 'critical';
    ELSIF v_new_stock <= v_inventory.reorder_point THEN
      v_alert_type := 'low_stock';
      v_severity   := 'low';
    ELSE
      -- Stock is above reorder point; no alert needed
      RETURN NEW;
    END IF;

    -- Avoid duplicate unacknowledged alerts of the same type
    IF NOT EXISTS (
      SELECT 1 FROM stock_alerts
      WHERE inventory_id = v_inventory.id
        AND alert_type   = v_alert_type
        AND acknowledged = false
    ) THEN
      INSERT INTO stock_alerts (inventory_id, alert_type, severity)
      VALUES (v_inventory.id, v_alert_type, v_severity);
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_scan_session_after_insert
AFTER INSERT ON scan_sessions
FOR EACH ROW
WHEN (NEW.product_id IS NOT NULL)
EXECUTE FUNCTION fn_apply_scan_to_inventory();

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: get_low_stock_items(p_location_id uuid)
-- Returns all inventory items at or below their reorder point for a location
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_low_stock_items(p_location_id uuid)
RETURNS TABLE (
  inventory_id    uuid,
  product_id      uuid,
  product_name    text,
  sku             text,
  brand           text,
  unit            text,
  category_name   text,
  category_color  text,
  current_stock   numeric,
  reorder_point   numeric,
  max_stock       numeric,
  cost_per_unit   numeric,
  last_counted_at timestamptz,
  alert_severity  text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    i.id             AS inventory_id,
    p.id             AS product_id,
    p.name           AS product_name,
    p.sku,
    p.brand,
    p.unit,
    pc.name          AS category_name,
    pc.color         AS category_color,
    i.current_stock,
    i.reorder_point,
    i.max_stock,
    i.cost_per_unit,
    i.last_counted_at,
    CASE
      WHEN i.current_stock <= 0                        THEN 'critical'
      WHEN i.current_stock <= i.reorder_point * 0.25   THEN 'critical'
      ELSE 'low'
    END AS alert_severity
  FROM inventory i
  JOIN products p         ON p.id = i.product_id
  LEFT JOIN product_categories pc ON pc.id = p.category_id
  WHERE i.location_id   = p_location_id
    AND i.current_stock <= i.reorder_point
  ORDER BY alert_severity DESC, i.current_stock ASC;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- All tables scoped by org membership via org_members
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE organizations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory          ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders    ENABLE ROW LEVEL SECURITY;

-- Helper function: returns org IDs the current user belongs to
CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT org_id FROM org_members WHERE user_id = auth.uid();
$$;

-- ── organizations ──

CREATE POLICY "org_members_can_see_org"
  ON organizations FOR SELECT
  USING (id IN (SELECT user_org_ids()));

CREATE POLICY "org_owners_can_update_org"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ── org_members ──

CREATE POLICY "org_members_can_see_members"
  ON org_members FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

-- ── locations ──

CREATE POLICY "org_members_see_locations"
  ON locations FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "org_managers_manage_locations"
  ON locations FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

-- ── product_categories ──

CREATE POLICY "org_members_see_categories"
  ON product_categories FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "org_managers_manage_categories"
  ON product_categories FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

-- ── products ──

CREATE POLICY "org_members_see_products"
  ON products FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "org_members_insert_products"
  ON products FOR INSERT
  WITH CHECK (org_id IN (SELECT user_org_ids()));

CREATE POLICY "org_members_update_products"
  ON products FOR UPDATE
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "org_managers_delete_products"
  ON products FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

-- ── inventory ──

CREATE POLICY "org_members_see_inventory"
  ON inventory FOR SELECT
  USING (
    location_id IN (
      SELECT l.id FROM locations l WHERE l.org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY "org_members_manage_inventory"
  ON inventory FOR ALL
  USING (
    location_id IN (
      SELECT l.id FROM locations l WHERE l.org_id IN (SELECT user_org_ids())
    )
  );

-- ── scan_sessions ──

CREATE POLICY "org_members_see_scans"
  ON scan_sessions FOR SELECT
  USING (
    location_id IN (
      SELECT l.id FROM locations l WHERE l.org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY "org_members_insert_scans"
  ON scan_sessions FOR INSERT
  WITH CHECK (
    scanned_by = auth.uid()
    AND location_id IN (
      SELECT l.id FROM locations l WHERE l.org_id IN (SELECT user_org_ids())
    )
  );

-- ── stock_alerts ──

CREATE POLICY "org_members_see_alerts"
  ON stock_alerts FOR SELECT
  USING (
    inventory_id IN (
      SELECT i.id FROM inventory i
      JOIN locations l ON l.id = i.location_id
      WHERE l.org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY "org_members_acknowledge_alerts"
  ON stock_alerts FOR UPDATE
  USING (
    inventory_id IN (
      SELECT i.id FROM inventory i
      JOIN locations l ON l.id = i.location_id
      WHERE l.org_id IN (SELECT user_org_ids())
    )
  );

-- ── purchase_orders ──

CREATE POLICY "org_members_see_pos"
  ON purchase_orders FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "org_members_create_pos"
  ON purchase_orders FOR INSERT
  WITH CHECK (
    generated_by = auth.uid()
    AND org_id IN (SELECT user_org_ids())
  );

CREATE POLICY "org_members_update_pos"
  ON purchase_orders FOR UPDATE
  USING (org_id IN (SELECT user_org_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed default product categories for newly created orgs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_seed_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO product_categories (org_id, name, color) VALUES
    (NEW.id, 'Beverages',  '#3B82F6'),
    (NEW.id, 'Produce',    '#22C55E'),
    (NEW.id, 'Dry Goods',  '#F59E0B'),
    (NEW.id, 'Dairy',      '#A78BFA'),
    (NEW.id, 'Meat',       '#EF4444'),
    (NEW.id, 'Cleaning',   '#06B6D4'),
    (NEW.id, 'Other',      '#6B7280');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_seed_categories_on_org_create
AFTER INSERT ON organizations
FOR EACH ROW
EXECUTE FUNCTION fn_seed_default_categories();

-- ─────────────────────────────────────────────────────────────────────────────
-- Update purchase_orders.updated_at automatically
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_purchase_orders_updated_at
BEFORE UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();
