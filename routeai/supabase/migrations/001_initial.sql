-- ============================================================
-- RouteAI: Initial Database Schema
-- Migration: 001_initial
-- ============================================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  industry    TEXT NOT NULL DEFAULT 'field_service', -- e.g. hvac, plumbing, electrical
  timezone    TEXT NOT NULL DEFAULT 'UTC',
  settings    JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_industry ON organizations (industry);

-- ============================================================
-- ORG MEMBERS
-- ============================================================

CREATE TABLE org_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'technician', -- dispatcher, technician, admin
  skills     TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, user_id)
);

CREATE INDEX idx_org_members_org_id   ON org_members (org_id);
CREATE INDEX idx_org_members_user_id  ON org_members (user_id);

-- ============================================================
-- CUSTOMERS
-- ============================================================

CREATE TABLE customers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  address    TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  latitude   NUMERIC(10, 7),
  longitude  NUMERIC(10, 7),
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_org_id ON customers (org_id);
CREATE INDEX idx_customers_name   ON customers (org_id, name);

-- ============================================================
-- DRIVERS (Technicians)
-- ============================================================

CREATE TABLE drivers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  phone           TEXT,
  status          TEXT NOT NULL DEFAULT 'available', -- available, on_job, offline
  current_lat     NUMERIC(10, 7),
  current_lng     NUMERIC(10, 7),
  lifetime_jobs   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, org_id)
);

CREATE INDEX idx_drivers_org_id   ON drivers (org_id);
CREATE INDEX idx_drivers_user_id  ON drivers (user_id);
CREATE INDEX idx_drivers_status   ON drivers (org_id, status);

-- ============================================================
-- JOBS
-- ============================================================

CREATE TABLE jobs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  customer_id         UUID REFERENCES customers (id) ON DELETE SET NULL,
  assigned_driver_id  UUID REFERENCES drivers (id) ON DELETE SET NULL,
  service_type        TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending', -- pending, en_route, in_progress, completed, cancelled
  priority            TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  scheduled_at        TIMESTAMPTZ,
  estimated_duration  INT NOT NULL DEFAULT 60, -- minutes
  actual_start        TIMESTAMPTZ,
  actual_end          TIMESTAMPTZ,
  notes               TEXT,
  raw_input_text      TEXT, -- original text from AI parsing
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_org_id             ON jobs (org_id);
CREATE INDEX idx_jobs_driver_id          ON jobs (assigned_driver_id);
CREATE INDEX idx_jobs_customer_id        ON jobs (customer_id);
CREATE INDEX idx_jobs_status             ON jobs (org_id, status);
CREATE INDEX idx_jobs_scheduled_at       ON jobs (org_id, scheduled_at);
CREATE INDEX idx_jobs_priority           ON jobs (org_id, priority);

-- ============================================================
-- ROUTES
-- ============================================================

CREATE TABLE routes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  driver_id    UUID NOT NULL REFERENCES drivers (id) ON DELETE CASCADE,
  route_date   DATE NOT NULL,
  status       TEXT NOT NULL DEFAULT 'draft', -- draft, active, completed
  total_stops  INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (driver_id, route_date)
);

CREATE INDEX idx_routes_org_id      ON routes (org_id);
CREATE INDEX idx_routes_driver_id   ON routes (driver_id);
CREATE INDEX idx_routes_route_date  ON routes (driver_id, route_date);
CREATE INDEX idx_routes_status      ON routes (org_id, status);

-- ============================================================
-- STOPS
-- ============================================================

CREATE TABLE stops (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id       UUID NOT NULL REFERENCES routes (id) ON DELETE CASCADE,
  job_id         UUID NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
  order_index    INT NOT NULL DEFAULT 0,
  scheduled_time TIMESTAMPTZ,
  status         TEXT NOT NULL DEFAULT 'pending', -- pending, en_route, in_progress, completed, cancelled
  started_at     TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (route_id, job_id)
);

CREATE INDEX idx_stops_route_id  ON stops (route_id);
CREATE INDEX idx_stops_job_id    ON stops (job_id);
CREATE INDEX idx_stops_status    ON stops (route_id, status);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id  UUID NOT NULL REFERENCES drivers (id) ON DELETE CASCADE,
  type       TEXT NOT NULL, -- route_update, new_job, schedule_change, emergency, message
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  data       JSONB DEFAULT '{}'::JSONB,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_driver_id  ON notifications (driver_id);
CREATE INDEX idx_notifications_read       ON notifications (driver_id, read);
CREATE INDEX idx_notifications_created_at ON notifications (driver_id, created_at DESC);

-- ============================================================
-- TRIGGERS: updated_at auto-update
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_organizations
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_customers
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_drivers
  BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_jobs
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_routes
  BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- TRIGGER: increment driver lifetime_jobs when stop completed
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_increment_driver_lifetime_jobs()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire when status changes TO 'completed' (not already completed)
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE drivers d
    SET lifetime_jobs = d.lifetime_jobs + 1
    FROM routes r
    WHERE r.id = NEW.route_id
      AND d.id = r.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_lifetime_jobs_on_stop_complete
  AFTER UPDATE OF status ON stops
  FOR EACH ROW EXECUTE FUNCTION trigger_increment_driver_lifetime_jobs();

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

ALTER TABLE organizations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;

-- ── Helper: get org_id for current auth user ─────────────────────────────────

CREATE OR REPLACE FUNCTION auth_user_org_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT org_id FROM org_members WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ── Organizations: visible to own org members ────────────────────────────────

CREATE POLICY org_select ON organizations
  FOR SELECT USING (id = auth_user_org_id());

-- ── Org Members ──────────────────────────────────────────────────────────────

CREATE POLICY org_members_select ON org_members
  FOR SELECT USING (org_id = auth_user_org_id());

-- ── Customers ────────────────────────────────────────────────────────────────

CREATE POLICY customers_select ON customers
  FOR SELECT USING (org_id = auth_user_org_id());

CREATE POLICY customers_insert ON customers
  FOR INSERT WITH CHECK (org_id = auth_user_org_id());

CREATE POLICY customers_update ON customers
  FOR UPDATE USING (org_id = auth_user_org_id());

-- ── Drivers ──────────────────────────────────────────────────────────────────

CREATE POLICY drivers_select ON drivers
  FOR SELECT USING (org_id = auth_user_org_id());

CREATE POLICY drivers_update_own ON drivers
  FOR UPDATE USING (user_id = auth.uid());

-- ── Jobs ─────────────────────────────────────────────────────────────────────

CREATE POLICY jobs_select ON jobs
  FOR SELECT USING (org_id = auth_user_org_id());

CREATE POLICY jobs_insert ON jobs
  FOR INSERT WITH CHECK (org_id = auth_user_org_id());

CREATE POLICY jobs_update ON jobs
  FOR UPDATE USING (org_id = auth_user_org_id());

-- ── Routes ───────────────────────────────────────────────────────────────────

CREATE POLICY routes_select ON routes
  FOR SELECT USING (org_id = auth_user_org_id());

CREATE POLICY routes_insert ON routes
  FOR INSERT WITH CHECK (org_id = auth_user_org_id());

CREATE POLICY routes_update ON routes
  FOR UPDATE USING (org_id = auth_user_org_id());

-- ── Stops ────────────────────────────────────────────────────────────────────

CREATE POLICY stops_select ON stops
  FOR SELECT USING (
    route_id IN (
      SELECT id FROM routes WHERE org_id = auth_user_org_id()
    )
  );

CREATE POLICY stops_insert ON stops
  FOR INSERT WITH CHECK (
    route_id IN (
      SELECT id FROM routes WHERE org_id = auth_user_org_id()
    )
  );

CREATE POLICY stops_update ON stops
  FOR UPDATE USING (
    route_id IN (
      SELECT id FROM routes WHERE org_id = auth_user_org_id()
    )
  );

-- ── Notifications ────────────────────────────────────────────────────────────

CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- REALTIME: enable for live sync tables
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE stops;
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE drivers;
