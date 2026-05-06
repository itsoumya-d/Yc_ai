# RouteAI — Database Schema

## Entity Relationship Summary

```
organizations (tenant root)
├── users (auth, belongs to org via org_members)
├── org_members (join table: user <-> org, role)
├── drivers (technicians/field staff)
│   └── driver_locations (GPS breadcrumb trail)
├── vehicles (fleet)
├── customers (service recipients)
│   └── customer_equipment (installed systems at address)
├── jobs (work orders)
│   ├── job_notes (technician/dispatcher notes + photos)
│   └── job_photos (work documentation)
├── routes (daily optimized route per driver)
│   └── stops (ordered job assignments within a route)
├── optimizations (before/after optimization logs)
├── schedules (recurring job templates)
├── notifications (SMS/push log)
└── subscriptions (Stripe billing)
```

All data tables carry `org_id` for Row Level Security isolation. The `organizations` table is the multi-tenant root.

---

## Complete SQL DDL

### Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Organizations

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    industry TEXT NOT NULL DEFAULT 'general',
    phone TEXT,
    email TEXT,
    address TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    timezone TEXT NOT NULL DEFAULT 'America/New_York',
    settings JSONB NOT NULL DEFAULT '{
        "buffer_minutes": 15,
        "shift_start": "08:00",
        "shift_end": "17:00",
        "notification_hours_start": 8,
        "notification_hours_end": 20,
        "optimization_auto_apply": false,
        "sms_enabled": true
    }'::jsonb,
    logo_url TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Org Members

```sql
CREATE TABLE org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'dispatcher'
        CHECK (role IN ('owner', 'admin', 'dispatcher', 'viewer')),
    invited_email TEXT,
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, user_id)
);
```

### Drivers

```sql
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    skills TEXT[] NOT NULL DEFAULT '{}',
    certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
    home_address TEXT,
    home_lat DOUBLE PRECISION,
    home_lng DOUBLE PRECISION,
    shift_start TIME NOT NULL DEFAULT '08:00',
    shift_end TIME NOT NULL DEFAULT '17:00',
    max_jobs_per_day INT NOT NULL DEFAULT 8,
    hourly_rate NUMERIC(10, 2),
    status TEXT NOT NULL DEFAULT 'off_duty'
        CHECK (status IN ('available', 'en_route', 'on_job', 'break', 'off_duty')),
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    current_heading DOUBLE PRECISION,
    last_location_update TIMESTAMPTZ,
    vehicle_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Vehicles

```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    make TEXT,
    model TEXT,
    year INT,
    license_plate TEXT,
    vin TEXT,
    color TEXT,
    odometer_miles NUMERIC(10, 1),
    fuel_type TEXT DEFAULT 'gasoline'
        CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid')),
    status TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
    insurance_expiry DATE,
    last_service_date DATE,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK from drivers to vehicles after both tables exist
ALTER TABLE drivers
    ADD CONSTRAINT fk_drivers_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;
```

### Customers

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    unit TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    preferences JSONB NOT NULL DEFAULT '{
        "preferred_technician_id": null,
        "preferred_time": null,
        "access_instructions": null,
        "pets": null,
        "notification_opt_in": true,
        "language": "en"
    }'::jsonb,
    notification_opt_in BOOLEAN NOT NULL DEFAULT true,
    lifetime_jobs INT NOT NULL DEFAULT 0,
    average_rating NUMERIC(3, 2),
    tags TEXT[] NOT NULL DEFAULT '{}',
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Jobs

```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    route_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    job_type TEXT NOT NULL DEFAULT 'repair'
        CHECK (job_type IN ('repair', 'install', 'maintenance', 'inspection', 'emergency', 'estimate', 'callback')),
    priority TEXT NOT NULL DEFAULT 'normal'
        CHECK (priority IN ('low', 'normal', 'high', 'emergency')),
    status TEXT NOT NULL DEFAULT 'unscheduled'
        CHECK (status IN ('unscheduled', 'scheduled', 'en_route', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    estimated_duration_minutes INT NOT NULL DEFAULT 60,
    actual_duration_minutes INT,
    scheduled_date DATE,
    time_window_start TIME,
    time_window_end TIME,
    scheduled_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    address TEXT NOT NULL,
    unit TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    route_order INT,
    source TEXT NOT NULL DEFAULT 'manual'
        CHECK (source IN ('manual', 'phone_ai', 'sms_ai', 'recurring', 'web_booking')),
    raw_intake_text TEXT,
    ai_parsed_data JSONB,
    completion_notes TEXT,
    customer_rating INT CHECK (customer_rating BETWEEN 1 AND 5),
    customer_feedback TEXT,
    parts_used JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_cost NUMERIC(10, 2),
    is_locked BOOLEAN NOT NULL DEFAULT false,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Routes

```sql
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    route_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'optimized', 'active', 'completed', 'cancelled')),
    total_drive_time_minutes INT,
    total_distance_miles NUMERIC(10, 2),
    total_jobs INT NOT NULL DEFAULT 0,
    total_service_time_minutes INT,
    optimization_score NUMERIC(5, 2),
    route_polyline TEXT,
    start_address TEXT,
    start_lat DOUBLE PRECISION,
    start_lng DOUBLE PRECISION,
    end_address TEXT,
    end_lat DOUBLE PRECISION,
    end_lng DOUBLE PRECISION,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (driver_id, route_date)
);

-- Add FK from jobs to routes after routes table exists
ALTER TABLE jobs
    ADD CONSTRAINT fk_jobs_route
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL;
```

### Stops

```sql
CREATE TABLE stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    stop_order INT NOT NULL,
    estimated_arrival TIMESTAMPTZ,
    estimated_departure TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,
    drive_time_from_previous_minutes INT,
    drive_distance_from_previous_miles NUMERIC(10, 2),
    segment_polyline TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'en_route', 'arrived', 'in_progress', 'completed', 'skipped')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (route_id, stop_order),
    UNIQUE (route_id, job_id)
);
```

### Optimizations

```sql
CREATE TABLE optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    optimization_date DATE NOT NULL,
    optimization_type TEXT NOT NULL DEFAULT 'daily_plan'
        CHECK (optimization_type IN ('daily_plan', 'reoptimize', 'emergency_insert', 'sick_coverage', 'manual_trigger')),
    trigger_event TEXT,
    status TEXT NOT NULL DEFAULT 'running'
        CHECK (status IN ('running', 'completed', 'failed', 'applied', 'rejected')),
    before_total_drive_minutes INT,
    after_total_drive_minutes INT,
    time_saved_minutes INT,
    before_total_distance_miles NUMERIC(10, 2),
    after_total_distance_miles NUMERIC(10, 2),
    distance_saved_miles NUMERIC(10, 2),
    jobs_affected INT NOT NULL DEFAULT 0,
    drivers_affected INT NOT NULL DEFAULT 0,
    solver_duration_ms INT,
    disruption_score NUMERIC(5, 2),
    constraint_violations JSONB NOT NULL DEFAULT '[]'::jsonb,
    solution_data JSONB,
    applied_at TIMESTAMPTZ,
    applied_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Schedules (Recurring Jobs)

```sql
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    job_type TEXT NOT NULL DEFAULT 'maintenance'
        CHECK (job_type IN ('repair', 'install', 'maintenance', 'inspection', 'emergency', 'estimate', 'callback')),
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    estimated_duration_minutes INT NOT NULL DEFAULT 60,
    preferred_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    address TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    recurrence_rule TEXT NOT NULL,
    recurrence_interval INT NOT NULL DEFAULT 1,
    preferred_day_of_week INT,
    preferred_time_start TIME,
    preferred_time_end TIME,
    next_occurrence DATE,
    last_generated DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    type TEXT NOT NULL
        CHECK (type IN (
            'appointment_confirmed', 'tech_en_route', 'eta_update',
            'job_completed', 'job_rescheduled', 'job_cancelled',
            'route_changed', 'new_assignment', 'schedule_optimized',
            'shift_reminder', 'dispatch_message', 'customer_reply'
        )),
    channel TEXT NOT NULL DEFAULT 'sms'
        CHECK (channel IN ('sms', 'push', 'email', 'in_app')),
    recipient_phone TEXT,
    recipient_email TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    tracking_url TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    delivery_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    twilio_sid TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Subscriptions

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    plan TEXT NOT NULL DEFAULT 'starter'
        CHECK (plan IN ('starter', 'growth', 'scale', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'trialing'
        CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'paused')),
    driver_limit INT NOT NULL DEFAULT 5,
    jobs_per_month_limit INT NOT NULL DEFAULT 500,
    sms_limit INT NOT NULL DEFAULT 1000,
    optimizations_per_day_limit INT NOT NULL DEFAULT 2,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    drivers_used INT NOT NULL DEFAULT 0,
    jobs_used_this_period INT NOT NULL DEFAULT 0,
    sms_used_this_period INT NOT NULL DEFAULT 0,
    optimizations_used_today INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id)
);
```

### Audit Logs

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Indexes

### Primary Lookup Indexes

```sql
-- Org Members
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);

-- Drivers
CREATE INDEX idx_drivers_org_id ON drivers(org_id);
CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_vehicle_id ON drivers(vehicle_id);
CREATE INDEX idx_drivers_status ON drivers(org_id, status) WHERE is_active = true;

-- Vehicles
CREATE INDEX idx_vehicles_org_id ON vehicles(org_id);

-- Customers
CREATE INDEX idx_customers_org_id ON customers(org_id);
CREATE INDEX idx_customers_phone ON customers(org_id, phone);
CREATE INDEX idx_customers_email ON customers(org_id, email);
CREATE INDEX idx_customers_name_trgm ON customers USING gin (name gin_trgm_ops);

-- Jobs
CREATE INDEX idx_jobs_org_id ON jobs(org_id);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_driver_id ON jobs(driver_id);
CREATE INDEX idx_jobs_route_id ON jobs(route_id);
CREATE INDEX idx_jobs_status ON jobs(org_id, status);
CREATE INDEX idx_jobs_scheduled_date ON jobs(org_id, scheduled_date);
CREATE INDEX idx_jobs_priority ON jobs(org_id, priority) WHERE status NOT IN ('completed', 'cancelled');
CREATE INDEX idx_jobs_driver_date ON jobs(driver_id, scheduled_date);
CREATE INDEX idx_jobs_title_trgm ON jobs USING gin (title gin_trgm_ops);

-- Routes
CREATE INDEX idx_routes_org_id ON routes(org_id);
CREATE INDEX idx_routes_driver_id ON routes(driver_id);
CREATE INDEX idx_routes_date ON routes(org_id, route_date);
CREATE INDEX idx_routes_status ON routes(org_id, status);

-- Stops
CREATE INDEX idx_stops_org_id ON stops(org_id);
CREATE INDEX idx_stops_route_id ON stops(route_id);
CREATE INDEX idx_stops_job_id ON stops(job_id);

-- Optimizations
CREATE INDEX idx_optimizations_org_id ON optimizations(org_id);
CREATE INDEX idx_optimizations_date ON optimizations(org_id, optimization_date);

-- Schedules
CREATE INDEX idx_schedules_org_id ON schedules(org_id);
CREATE INDEX idx_schedules_customer_id ON schedules(customer_id);
CREATE INDEX idx_schedules_next_occurrence ON schedules(next_occurrence) WHERE is_active = true;

-- Notifications
CREATE INDEX idx_notifications_org_id ON notifications(org_id);
CREATE INDEX idx_notifications_job_id ON notifications(job_id);
CREATE INDEX idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX idx_notifications_driver_id ON notifications(driver_id);
CREATE INDEX idx_notifications_type ON notifications(org_id, type);
CREATE INDEX idx_notifications_created_at ON notifications(org_id, created_at DESC);

-- Subscriptions
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(org_id, created_at DESC);
```

---

## Row Level Security Policies

### Helper Function

```sql
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
    SELECT org_id
    FROM org_members
    WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Enable RLS on All Tables

```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### Policies

```sql
-- Organizations: members can view their own orgs
CREATE POLICY "org_member_select" ON organizations
    FOR SELECT USING (id IN (SELECT get_user_org_ids()));

CREATE POLICY "org_owner_update" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Users: can read own profile, members can see org colleagues
CREATE POLICY "users_select_self" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_select_org" ON users
    FOR SELECT USING (
        id IN (
            SELECT user_id FROM org_members
            WHERE org_id IN (SELECT get_user_org_ids())
        )
    );

CREATE POLICY "users_update_self" ON users
    FOR UPDATE USING (id = auth.uid());

-- Org Members: members can view colleagues
CREATE POLICY "org_members_select" ON org_members
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "org_members_manage" ON org_members
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Drivers: org members can read, admins can manage
CREATE POLICY "drivers_select" ON drivers
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "drivers_manage" ON drivers
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
        )
    );

-- Vehicles: org members can read, admins can manage
CREATE POLICY "vehicles_select" ON vehicles
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "vehicles_manage" ON vehicles
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Customers: org members can read, dispatchers+ can manage
CREATE POLICY "customers_select" ON customers
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "customers_manage" ON customers
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
        )
    );

-- Jobs: org members can read, dispatchers+ can manage
CREATE POLICY "jobs_select" ON jobs
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "jobs_manage" ON jobs
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
        )
    );

-- Routes: org members can read
CREATE POLICY "routes_select" ON routes
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "routes_manage" ON routes
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
        )
    );

-- Stops: org members can read
CREATE POLICY "stops_select" ON stops
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "stops_manage" ON stops
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
        )
    );

-- Optimizations: org members can read
CREATE POLICY "optimizations_select" ON optimizations
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

-- Schedules: org members can read, dispatchers+ can manage
CREATE POLICY "schedules_select" ON schedules
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "schedules_manage" ON schedules
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
        )
    );

-- Notifications: org members can read
CREATE POLICY "notifications_select" ON notifications
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

-- Subscriptions: org members can read, owners can manage
CREATE POLICY "subscriptions_select" ON subscriptions
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "subscriptions_manage" ON subscriptions
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Audit Logs: admins can read
CREATE POLICY "audit_logs_select" ON audit_logs
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );
```

---

## Database Functions & Triggers

### Auto-Update Timestamps

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON org_members
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON stops
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

### Audit Logging for Job Status Changes

```sql
CREATE OR REPLACE FUNCTION log_job_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_logs (org_id, user_id, action, table_name, record_id, old_data, new_data)
        VALUES (
            NEW.org_id,
            auth.uid(),
            'job_status_change',
            'jobs',
            NEW.id,
            jsonb_build_object(
                'status', OLD.status,
                'driver_id', OLD.driver_id,
                'route_order', OLD.route_order
            ),
            jsonb_build_object(
                'status', NEW.status,
                'driver_id', NEW.driver_id,
                'route_order', NEW.route_order
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_job_status
    AFTER UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION log_job_status_change();
```

### Audit Logging for Route Optimizations

```sql
CREATE OR REPLACE FUNCTION log_optimization_applied()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'applied' THEN
        INSERT INTO audit_logs (org_id, user_id, action, table_name, record_id, old_data, new_data)
        VALUES (
            NEW.org_id,
            auth.uid(),
            'optimization_applied',
            'optimizations',
            NEW.id,
            jsonb_build_object('status', OLD.status),
            jsonb_build_object(
                'status', NEW.status,
                'time_saved_minutes', NEW.time_saved_minutes,
                'jobs_affected', NEW.jobs_affected,
                'drivers_affected', NEW.drivers_affected
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_optimization
    AFTER UPDATE ON optimizations
    FOR EACH ROW
    EXECUTE FUNCTION log_optimization_applied();
```

### Auto-Create User Profile on Sign-Up

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
```

### Update Route Totals When Stops Change

```sql
CREATE OR REPLACE FUNCTION update_route_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_route_id UUID;
BEGIN
    v_route_id := COALESCE(NEW.route_id, OLD.route_id);

    UPDATE routes SET
        total_jobs = (SELECT COUNT(*) FROM stops WHERE route_id = v_route_id),
        total_drive_time_minutes = (
            SELECT COALESCE(SUM(drive_time_from_previous_minutes), 0)
            FROM stops WHERE route_id = v_route_id
        ),
        total_distance_miles = (
            SELECT COALESCE(SUM(drive_distance_from_previous_miles), 0)
            FROM stops WHERE route_id = v_route_id
        ),
        total_service_time_minutes = (
            SELECT COALESCE(SUM(j.estimated_duration_minutes), 0)
            FROM stops s JOIN jobs j ON j.id = s.job_id
            WHERE s.route_id = v_route_id
        )
    WHERE id = v_route_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER recalculate_route_totals
    AFTER INSERT OR UPDATE OR DELETE ON stops
    FOR EACH ROW
    EXECUTE FUNCTION update_route_totals();
```

### Increment Customer Lifetime Jobs on Completion

```sql
CREATE OR REPLACE FUNCTION update_customer_lifetime_jobs()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed' AND NEW.customer_id IS NOT NULL THEN
        UPDATE customers
        SET lifetime_jobs = lifetime_jobs + 1
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER increment_customer_jobs
    AFTER UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_lifetime_jobs();
```

---

## TypeScript Interfaces

```typescript
export interface Organization {
    id: string;
    name: string;
    slug: string;
    industry: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
    timezone: string;
    settings: {
        buffer_minutes: number;
        shift_start: string;
        shift_end: string;
        notification_hours_start: number;
        notification_hours_end: number;
        optimization_auto_apply: boolean;
        sms_enabled: boolean;
    };
    logo_url: string | null;
    stripe_customer_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrgMember {
    id: string;
    org_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'dispatcher' | 'viewer';
    invited_email: string | null;
    invited_at: string | null;
    joined_at: string;
    created_at: string;
    updated_at: string;
}

export interface Driver {
    id: string;
    org_id: string;
    user_id: string | null;
    name: string;
    phone: string | null;
    email: string | null;
    avatar_url: string | null;
    skills: string[];
    certifications: Array<{
        name: string;
        issued_date: string;
        expiry_date: string | null;
        issuer: string;
    }>;
    home_address: string | null;
    home_lat: number | null;
    home_lng: number | null;
    shift_start: string;
    shift_end: string;
    max_jobs_per_day: number;
    hourly_rate: number | null;
    status: 'available' | 'en_route' | 'on_job' | 'break' | 'off_duty';
    current_lat: number | null;
    current_lng: number | null;
    current_heading: number | null;
    last_location_update: string | null;
    vehicle_id: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Vehicle {
    id: string;
    org_id: string;
    name: string;
    make: string | null;
    model: string | null;
    year: number | null;
    license_plate: string | null;
    vin: string | null;
    color: string | null;
    odometer_miles: number | null;
    fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
    status: 'available' | 'in_use' | 'maintenance' | 'retired';
    insurance_expiry: string | null;
    last_service_date: string | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Customer {
    id: string;
    org_id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    unit: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    lat: number | null;
    lng: number | null;
    preferences: {
        preferred_technician_id: string | null;
        preferred_time: string | null;
        access_instructions: string | null;
        pets: string | null;
        notification_opt_in: boolean;
        language: string;
    };
    notification_opt_in: boolean;
    lifetime_jobs: number;
    average_rating: number | null;
    tags: string[];
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type JobType = 'repair' | 'install' | 'maintenance' | 'inspection' | 'emergency' | 'estimate' | 'callback';
export type JobPriority = 'low' | 'normal' | 'high' | 'emergency';
export type JobStatus = 'unscheduled' | 'scheduled' | 'en_route' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
export type JobSource = 'manual' | 'phone_ai' | 'sms_ai' | 'recurring' | 'web_booking';

export interface Job {
    id: string;
    org_id: string;
    customer_id: string | null;
    driver_id: string | null;
    route_id: string | null;
    title: string;
    description: string | null;
    job_type: JobType;
    priority: JobPriority;
    status: JobStatus;
    required_skills: string[];
    estimated_duration_minutes: number;
    actual_duration_minutes: number | null;
    scheduled_date: string | null;
    time_window_start: string | null;
    time_window_end: string | null;
    scheduled_arrival: string | null;
    actual_arrival: string | null;
    actual_start: string | null;
    actual_end: string | null;
    address: string;
    unit: string | null;
    lat: number;
    lng: number;
    route_order: number | null;
    source: JobSource;
    raw_intake_text: string | null;
    ai_parsed_data: Record<string, unknown> | null;
    completion_notes: string | null;
    customer_rating: number | null;
    customer_feedback: string | null;
    parts_used: Array<{
        name: string;
        quantity: number;
        cost: number;
    }>;
    total_cost: number | null;
    is_locked: boolean;
    cancellation_reason: string | null;
    created_at: string;
    updated_at: string;
}

export interface Route {
    id: string;
    org_id: string;
    driver_id: string;
    route_date: string;
    status: 'draft' | 'optimized' | 'active' | 'completed' | 'cancelled';
    total_drive_time_minutes: number | null;
    total_distance_miles: number | null;
    total_jobs: number;
    total_service_time_minutes: number | null;
    optimization_score: number | null;
    route_polyline: string | null;
    start_address: string | null;
    start_lat: number | null;
    start_lng: number | null;
    end_address: string | null;
    end_lat: number | null;
    end_lng: number | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Stop {
    id: string;
    org_id: string;
    route_id: string;
    job_id: string;
    stop_order: number;
    estimated_arrival: string | null;
    estimated_departure: string | null;
    actual_arrival: string | null;
    actual_departure: string | null;
    drive_time_from_previous_minutes: number | null;
    drive_distance_from_previous_miles: number | null;
    segment_polyline: string | null;
    status: 'pending' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'skipped';
    created_at: string;
    updated_at: string;
}

export interface Optimization {
    id: string;
    org_id: string;
    optimization_date: string;
    optimization_type: 'daily_plan' | 'reoptimize' | 'emergency_insert' | 'sick_coverage' | 'manual_trigger';
    trigger_event: string | null;
    status: 'running' | 'completed' | 'failed' | 'applied' | 'rejected';
    before_total_drive_minutes: number | null;
    after_total_drive_minutes: number | null;
    time_saved_minutes: number | null;
    before_total_distance_miles: number | null;
    after_total_distance_miles: number | null;
    distance_saved_miles: number | null;
    jobs_affected: number;
    drivers_affected: number;
    solver_duration_ms: number | null;
    disruption_score: number | null;
    constraint_violations: Array<{
        type: string;
        description: string;
        severity: string;
    }>;
    solution_data: Record<string, unknown> | null;
    applied_at: string | null;
    applied_by: string | null;
    created_at: string;
}

export interface Schedule {
    id: string;
    org_id: string;
    customer_id: string;
    title: string;
    description: string | null;
    job_type: JobType;
    required_skills: string[];
    estimated_duration_minutes: number;
    preferred_driver_id: string | null;
    address: string;
    lat: number;
    lng: number;
    recurrence_rule: string;
    recurrence_interval: number;
    preferred_day_of_week: number | null;
    preferred_time_start: string | null;
    preferred_time_end: string | null;
    next_occurrence: string | null;
    last_generated: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type NotificationType =
    | 'appointment_confirmed' | 'tech_en_route' | 'eta_update'
    | 'job_completed' | 'job_rescheduled' | 'job_cancelled'
    | 'route_changed' | 'new_assignment' | 'schedule_optimized'
    | 'shift_reminder' | 'dispatch_message' | 'customer_reply';

export interface Notification {
    id: string;
    org_id: string;
    job_id: string | null;
    customer_id: string | null;
    driver_id: string | null;
    type: NotificationType;
    channel: 'sms' | 'push' | 'email' | 'in_app';
    recipient_phone: string | null;
    recipient_email: string | null;
    subject: string | null;
    message: string;
    tracking_url: string | null;
    sent_at: string | null;
    delivered_at: string | null;
    read_at: string | null;
    delivery_status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
    twilio_sid: string | null;
    error_message: string | null;
    created_at: string;
}

export interface Subscription {
    id: string;
    org_id: string;
    stripe_subscription_id: string | null;
    stripe_price_id: string | null;
    plan: 'starter' | 'growth' | 'scale' | 'enterprise';
    status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'paused';
    driver_limit: number;
    jobs_per_month_limit: number;
    sms_limit: number;
    optimizations_per_day_limit: number;
    current_period_start: string | null;
    current_period_end: string | null;
    trial_end: string | null;
    cancel_at: string | null;
    cancelled_at: string | null;
    drivers_used: number;
    jobs_used_this_period: number;
    sms_used_this_period: number;
    optimizations_used_today: number;
    created_at: string;
    updated_at: string;
}

export interface AuditLog {
    id: string;
    org_id: string;
    user_id: string | null;
    action: string;
    table_name: string;
    record_id: string | null;
    old_data: Record<string, unknown> | null;
    new_data: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}
```

---

## Seed Data

```sql
-- Demo Organization
INSERT INTO organizations (id, name, slug, industry, phone, timezone) VALUES
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Apex HVAC Services', 'apex-hvac', 'hvac', '(555) 100-0000', 'America/Chicago');

-- Demo Subscription
INSERT INTO subscriptions (org_id, plan, status, driver_limit, jobs_per_month_limit, sms_limit, optimizations_per_day_limit, current_period_start, current_period_end) VALUES
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'growth', 'active', 20, 2000, 5000, 10, now(), now() + INTERVAL '30 days');

-- Demo Vehicles
INSERT INTO vehicles (id, org_id, name, make, model, year, license_plate, fuel_type, status) VALUES
    ('v0000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Van 01', 'Ford', 'Transit 250', 2023, 'ABC-1234', 'gasoline', 'in_use'),
    ('v0000002-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Van 02', 'Ford', 'Transit 250', 2023, 'ABC-1235', 'gasoline', 'in_use'),
    ('v0000003-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Van 03', 'Ram', 'ProMaster 1500', 2024, 'DEF-5678', 'gasoline', 'available');

-- Demo Drivers
INSERT INTO drivers (id, org_id, name, phone, skills, home_address, home_lat, home_lng, status, vehicle_id) VALUES
    ('d0000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Mike Rodriguez', '(555) 201-0001', ARRAY['hvac_install', 'hvac_repair', 'epa_certified', 'carrier_certified'], '100 Technician Lane, Dallas, TX', 32.7767, -96.7970, 'available', 'v0000001-0000-0000-0000-000000000001'),
    ('d0000002-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Sarah Kim', '(555) 201-0002', ARRAY['plumbing_repair', 'plumbing_install', 'water_heater'], '200 Worker Ave, Dallas, TX', 32.7866, -96.8010, 'available', 'v0000002-0000-0000-0000-000000000002'),
    ('d0000003-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Tom Brooks', '(555) 201-0003', ARRAY['hvac_repair', 'hvac_maintenance', 'electrical_basic'], '300 Service Rd, Dallas, TX', 32.7700, -96.8100, 'off_duty', 'v0000003-0000-0000-0000-000000000003');

-- Demo Customers
INSERT INTO customers (id, org_id, name, phone, email, address, city, state, zip, lat, lng) VALUES
    ('c0000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'John Smith', '(555) 301-0001', 'john.smith@email.com', '1420 Elm Street', 'Dallas', 'TX', '75201', 32.7825, -96.7985),
    ('c0000002-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Maria Jones', '(555) 301-0002', 'maria.jones@email.com', '903 Oak Avenue', 'Dallas', 'TX', '75202', 32.7790, -96.8050),
    ('c0000003-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Kevin Brown', '(555) 301-0003', 'kevin.brown@email.com', '2105 Elm Boulevard', 'Dallas', 'TX', '75203', 32.7750, -96.7900);

-- Demo Jobs
INSERT INTO jobs (id, org_id, customer_id, driver_id, title, description, job_type, priority, status, required_skills, estimated_duration_minutes, scheduled_date, time_window_start, time_window_end, address, lat, lng, route_order, source) VALUES
    ('j0000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'AC Unit Not Cooling', 'Customer reports AC stopped blowing cold air. Carrier unit, 10 years old.', 'repair', 'high', 'scheduled', ARRAY['hvac_repair', 'carrier_certified'], 90, CURRENT_DATE, '10:00', '12:00', '1420 Elm Street, Dallas, TX 75201', 32.7825, -96.7985, 1, 'sms_ai'),
    ('j0000002-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'c0000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', 'Kitchen Faucet Leak Repair', 'Dripping kitchen faucet, water pooling under sink cabinet.', 'repair', 'normal', 'scheduled', ARRAY['plumbing_repair'], 60, CURRENT_DATE, '09:00', '11:00', '903 Oak Avenue, Dallas, TX 75202', 32.7790, -96.8050, 1, 'manual'),
    ('j0000003-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'c0000003-0000-0000-0000-000000000003', NULL, 'Annual Furnace Maintenance', 'Routine annual furnace tune-up and inspection.', 'maintenance', 'low', 'unscheduled', ARRAY['hvac_maintenance'], 60, NULL, NULL, NULL, '2105 Elm Boulevard, Dallas, TX 75203', 32.7750, -96.7900, NULL, 'recurring');

-- Demo Recurring Schedule
INSERT INTO schedules (org_id, customer_id, title, job_type, required_skills, estimated_duration_minutes, address, lat, lng, recurrence_rule, recurrence_interval, preferred_time_start, preferred_time_end, next_occurrence) VALUES
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'c0000003-0000-0000-0000-000000000003', 'Annual Furnace Maintenance', 'maintenance', ARRAY['hvac_maintenance'], 60, '2105 Elm Boulevard, Dallas, TX 75203', 32.7750, -96.7900, 'yearly', 1, '09:00', '17:00', CURRENT_DATE + INTERVAL '6 months');
```

---

## Migration Strategy

### Naming Convention

```
YYYYMMDDHHMMSS_description.sql
```

### Migration Order

```
20250101000001_create_extensions.sql
20250101000002_create_organizations.sql
20250101000003_create_users.sql
20250101000004_create_org_members.sql
20250101000005_create_vehicles.sql
20250101000006_create_drivers.sql
20250101000007_create_customers.sql
20250101000008_create_jobs.sql
20250101000009_create_routes.sql
20250101000010_create_stops.sql
20250101000011_create_optimizations.sql
20250101000012_create_schedules.sql
20250101000013_create_notifications.sql
20250101000014_create_subscriptions.sql
20250101000015_create_audit_logs.sql
20250101000016_add_foreign_key_constraints.sql
20250101000017_create_indexes.sql
20250101000018_enable_rls_policies.sql
20250101000019_create_functions_triggers.sql
20250101000020_seed_data.sql
```

### Rollback Strategy

Each migration file includes a corresponding `down` section:

```sql
-- 20250101000006_create_drivers.sql

-- UP
CREATE TABLE drivers ( ... );

-- DOWN
DROP TABLE IF EXISTS drivers CASCADE;
```

### Environment-Specific Seeds

- **Development:** Full demo data with 3 drivers, 3 customers, 3 vehicles, sample jobs and routes
- **Staging:** Reduced dataset for integration testing with Twilio test numbers and Stripe test keys
- **Production:** Empty tables, organizations created via onboarding flow
