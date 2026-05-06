# SpectraCAD -- Database Schema

## Entity Relationship Summary

```
orgs 1--* org_members *--1 users
orgs 1--* projects
projects 1--* schematics
schematics 1--* components (placed instances)
orgs 1--* component_library (shared catalog)
projects 1--* pcb_layouts
projects 1--* design_rules
projects 1--* bom_items
projects 1--* manufacturer_quotes
projects 1--* exports
orgs 1--* subscriptions
```

All data tables carry `org_id` for B2B org-level isolation. PCB design data (schematics, layouts) use JSONB columns for complex graph and geometry structures.

---

## Complete SQL DDL

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE project_status AS ENUM ('active', 'archived', 'template');
CREATE TYPE component_category AS ENUM ('resistor', 'capacitor', 'ic', 'connector', 'discrete', 'module', 'sensor', 'power', 'inductor', 'crystal', 'led', 'relay', 'other');
CREATE TYPE component_availability AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'eol', 'unknown');
CREATE TYPE pcb_layer_type AS ENUM ('f_cu', 'b_cu', 'in1_cu', 'in2_cu', 'in3_cu', 'in4_cu', 'f_silk', 'b_silk', 'f_mask', 'b_mask', 'f_paste', 'b_paste', 'edge_cuts', 'drill');
CREATE TYPE drc_severity AS ENUM ('error', 'warning', 'info');
CREATE TYPE quote_status AS ENUM ('pending', 'received', 'accepted', 'expired');
CREATE TYPE export_format AS ENUM ('gerber', 'pdf_schematic', 'svg', 'bom_csv', 'bom_excel', 'bom_pdf', 'pick_place', 'step_3d');
CREATE TYPE export_status AS ENUM ('generating', 'completed', 'failed');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'team', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');

-- ============================================================
-- TABLES
-- ============================================================

-- Organizations
CREATE TABLE orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    default_units TEXT NOT NULL DEFAULT 'mm',
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization Members
CREATE TABLE org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role org_role NOT NULL DEFAULT 'editor',
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, user_id)
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status project_status NOT NULL DEFAULT 'active',
    board_width_mm REAL,
    board_height_mm REAL,
    layer_count INTEGER NOT NULL DEFAULT 2,
    layer_stackup JSONB NOT NULL DEFAULT '[]',
    thumbnail_url TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    version_count INTEGER NOT NULL DEFAULT 1,
    current_version TEXT NOT NULL DEFAULT 'v1.0',
    version_history JSONB NOT NULL DEFAULT '[]',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Schematics (per project, multi-sheet support)
CREATE TABLE schematics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    sheet_number INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL DEFAULT 'Sheet 1',
    schematic_data JSONB NOT NULL DEFAULT '{}',
    net_list JSONB NOT NULL DEFAULT '[]',
    wire_data JSONB NOT NULL DEFAULT '[]',
    annotations JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, sheet_number)
);

-- Components (placed instances on schematics)
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schematic_id UUID NOT NULL REFERENCES schematics(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    library_component_id UUID REFERENCES component_library(id) ON DELETE SET NULL,
    reference_designator TEXT NOT NULL,
    value TEXT,
    footprint TEXT,
    position_x REAL NOT NULL DEFAULT 0,
    position_y REAL NOT NULL DEFAULT 0,
    rotation REAL NOT NULL DEFAULT 0,
    is_mirrored BOOLEAN NOT NULL DEFAULT false,
    pin_assignments JSONB NOT NULL DEFAULT '{}',
    properties JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Component Library (org-shared catalog)
CREATE TABLE component_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    mpn TEXT NOT NULL,
    manufacturer TEXT,
    description TEXT,
    category component_category NOT NULL DEFAULT 'other',
    subcategory TEXT,
    symbol_data JSONB NOT NULL DEFAULT '{}',
    footprint_data JSONB NOT NULL DEFAULT '{}',
    footprint_3d_url TEXT,
    datasheet_url TEXT,
    parametric_data JSONB NOT NULL DEFAULT '{}',
    package_type TEXT,
    pin_count INTEGER,
    availability component_availability NOT NULL DEFAULT 'unknown',
    unit_price_usd NUMERIC(10, 4),
    supplier_data JSONB NOT NULL DEFAULT '{}',
    is_custom BOOLEAN NOT NULL DEFAULT false,
    is_favorited BOOLEAN NOT NULL DEFAULT false,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PCB Layouts
CREATE TABLE pcb_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Main Layout',
    board_outline JSONB NOT NULL DEFAULT '{}',
    component_placements JSONB NOT NULL DEFAULT '[]',
    traces JSONB NOT NULL DEFAULT '[]',
    vias JSONB NOT NULL DEFAULT '[]',
    copper_fills JSONB NOT NULL DEFAULT '[]',
    dimensions JSONB NOT NULL DEFAULT '[]',
    layer_visibility JSONB NOT NULL DEFAULT '{}',
    routing_progress REAL NOT NULL DEFAULT 0,
    auto_route_config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Design Rules
CREATE TABLE design_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Default',
    is_active BOOLEAN NOT NULL DEFAULT true,
    manufacturer_preset TEXT,
    min_trace_width_mm REAL NOT NULL DEFAULT 0.2,
    min_clearance_mm REAL NOT NULL DEFAULT 0.15,
    min_via_diameter_mm REAL NOT NULL DEFAULT 0.3,
    min_via_drill_mm REAL NOT NULL DEFAULT 0.2,
    min_annular_ring_mm REAL NOT NULL DEFAULT 0.13,
    solder_mask_expansion_mm REAL NOT NULL DEFAULT 0.05,
    silkscreen_min_width_mm REAL NOT NULL DEFAULT 0.15,
    board_edge_clearance_mm REAL NOT NULL DEFAULT 0.3,
    net_class_rules JSONB NOT NULL DEFAULT '{}',
    custom_rules JSONB NOT NULL DEFAULT '[]',
    last_drc_run_at TIMESTAMPTZ,
    last_drc_errors INTEGER NOT NULL DEFAULT 0,
    last_drc_warnings INTEGER NOT NULL DEFAULT 0,
    last_drc_results JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BOM Items
CREATE TABLE bom_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    library_component_id UUID REFERENCES component_library(id) ON DELETE SET NULL,
    reference_designators TEXT[] NOT NULL DEFAULT '{}',
    mpn TEXT NOT NULL,
    manufacturer TEXT,
    description TEXT,
    value TEXT,
    footprint TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_1 NUMERIC(10, 4),
    unit_price_10 NUMERIC(10, 4),
    unit_price_100 NUMERIC(10, 4),
    unit_price_1000 NUMERIC(10, 4),
    preferred_supplier TEXT,
    supplier_links JSONB NOT NULL DEFAULT '{}',
    availability component_availability NOT NULL DEFAULT 'unknown',
    lead_time_days INTEGER,
    alternatives JSONB NOT NULL DEFAULT '[]',
    is_dnp BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Manufacturer Quotes
CREATE TABLE manufacturer_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    manufacturer TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    board_specs JSONB NOT NULL DEFAULT '{}',
    unit_price_usd NUMERIC(10, 4),
    total_price_usd NUMERIC(10, 2),
    lead_time_days INTEGER,
    shipping_cost_usd NUMERIC(10, 2),
    surface_finish TEXT,
    board_color TEXT DEFAULT 'green',
    status quote_status NOT NULL DEFAULT 'pending',
    quote_url TEXT,
    order_url TEXT,
    expires_at TIMESTAMPTZ,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exports
CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    format export_format NOT NULL,
    status export_status NOT NULL DEFAULT 'generating',
    file_url TEXT,
    file_size_bytes BIGINT,
    layers_included pcb_layer_type[],
    manufacturer_preset TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    error_message TEXT,
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'active',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    seats_limit INTEGER NOT NULL DEFAULT 1,
    projects_limit INTEGER NOT NULL DEFAULT 3,
    layer_limit INTEGER NOT NULL DEFAULT 2,
    ai_queries_limit INTEGER NOT NULL DEFAULT 50,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Indexes

```sql
-- org_members
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);

-- projects
CREATE INDEX idx_projects_org_id ON projects(org_id);
CREATE INDEX idx_projects_status ON projects(org_id, status);
CREATE INDEX idx_projects_tags ON projects USING GIN (tags);

-- schematics
CREATE INDEX idx_schematics_project_id ON schematics(project_id);
CREATE INDEX idx_schematics_org_id ON schematics(org_id);
CREATE INDEX idx_schematics_data ON schematics USING GIN (schematic_data);
CREATE INDEX idx_schematics_net_list ON schematics USING GIN (net_list);

-- components
CREATE INDEX idx_components_schematic_id ON components(schematic_id);
CREATE INDEX idx_components_project_id ON components(project_id);
CREATE INDEX idx_components_org_id ON components(org_id);
CREATE INDEX idx_components_ref_des ON components(project_id, reference_designator);
CREATE INDEX idx_components_library ON components(library_component_id);
CREATE INDEX idx_components_properties ON components USING GIN (properties);

-- component_library
CREATE INDEX idx_component_library_org_id ON component_library(org_id);
CREATE INDEX idx_component_library_mpn ON component_library(org_id, mpn);
CREATE INDEX idx_component_library_category ON component_library(org_id, category);
CREATE INDEX idx_component_library_search ON component_library USING GIN (description gin_trgm_ops);
CREATE INDEX idx_component_library_parametric ON component_library USING GIN (parametric_data);
CREATE INDEX idx_component_library_tags ON component_library USING GIN (tags);
CREATE INDEX idx_component_library_supplier ON component_library USING GIN (supplier_data);

-- pcb_layouts
CREATE INDEX idx_pcb_layouts_project_id ON pcb_layouts(project_id);
CREATE INDEX idx_pcb_layouts_org_id ON pcb_layouts(org_id);
CREATE INDEX idx_pcb_layouts_traces ON pcb_layouts USING GIN (traces);

-- design_rules
CREATE INDEX idx_design_rules_project_id ON design_rules(project_id);
CREATE INDEX idx_design_rules_org_id ON design_rules(org_id);
CREATE INDEX idx_design_rules_drc_results ON design_rules USING GIN (last_drc_results);

-- bom_items
CREATE INDEX idx_bom_items_project_id ON bom_items(project_id);
CREATE INDEX idx_bom_items_org_id ON bom_items(org_id);
CREATE INDEX idx_bom_items_mpn ON bom_items(mpn);
CREATE INDEX idx_bom_items_availability ON bom_items(org_id, availability);

-- manufacturer_quotes
CREATE INDEX idx_manufacturer_quotes_project_id ON manufacturer_quotes(project_id);
CREATE INDEX idx_manufacturer_quotes_org_id ON manufacturer_quotes(org_id);
CREATE INDEX idx_manufacturer_quotes_status ON manufacturer_quotes(status);

-- exports
CREATE INDEX idx_exports_project_id ON exports(project_id);
CREATE INDEX idx_exports_org_id ON exports(org_id);
CREATE INDEX idx_exports_format ON exports(org_id, format);

-- subscriptions
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_customer_id);

-- audit_log
CREATE INDEX idx_audit_log_org_id ON audit_log(org_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(org_id, created_at DESC);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
```

---

## Row Level Security Policies

```sql
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE schematics ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcb_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturer_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = check_org_id AND user_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION has_org_role(check_org_id UUID, required_roles org_role[])
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = check_org_id
          AND user_id = auth.uid()
          AND role = ANY(required_roles)
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Users
CREATE POLICY users_select ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY users_update ON users FOR UPDATE USING (id = auth.uid());

-- Orgs
CREATE POLICY orgs_select ON orgs FOR SELECT USING (is_org_member(id));
CREATE POLICY orgs_update ON orgs FOR UPDATE USING (has_org_role(id, ARRAY['owner','admin']::org_role[]));

-- Org Members
CREATE POLICY org_members_select ON org_members FOR SELECT USING (is_org_member(org_id));
CREATE POLICY org_members_insert ON org_members FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));
CREATE POLICY org_members_delete ON org_members FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

-- Projects
CREATE POLICY projects_select ON projects FOR SELECT USING (is_org_member(org_id));
CREATE POLICY projects_insert ON projects FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY projects_update ON projects FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY projects_delete ON projects FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

-- Schematics
CREATE POLICY schematics_select ON schematics FOR SELECT USING (is_org_member(org_id));
CREATE POLICY schematics_insert ON schematics FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY schematics_update ON schematics FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY schematics_delete ON schematics FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

-- Components
CREATE POLICY components_select ON components FOR SELECT USING (is_org_member(org_id));
CREATE POLICY components_insert ON components FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY components_update ON components FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY components_delete ON components FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- Component Library
CREATE POLICY component_library_select ON component_library FOR SELECT USING (is_org_member(org_id));
CREATE POLICY component_library_insert ON component_library FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY component_library_update ON component_library FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- PCB Layouts
CREATE POLICY pcb_layouts_select ON pcb_layouts FOR SELECT USING (is_org_member(org_id));
CREATE POLICY pcb_layouts_insert ON pcb_layouts FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY pcb_layouts_update ON pcb_layouts FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- Design Rules
CREATE POLICY design_rules_select ON design_rules FOR SELECT USING (is_org_member(org_id));
CREATE POLICY design_rules_insert ON design_rules FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY design_rules_update ON design_rules FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- BOM Items
CREATE POLICY bom_items_select ON bom_items FOR SELECT USING (is_org_member(org_id));
CREATE POLICY bom_items_insert ON bom_items FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY bom_items_update ON bom_items FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- Manufacturer Quotes
CREATE POLICY manufacturer_quotes_select ON manufacturer_quotes FOR SELECT USING (is_org_member(org_id));
CREATE POLICY manufacturer_quotes_insert ON manufacturer_quotes FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- Exports
CREATE POLICY exports_select ON exports FOR SELECT USING (is_org_member(org_id));
CREATE POLICY exports_insert ON exports FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- Subscriptions
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE USING (has_org_role(org_id, ARRAY['owner']::org_role[]));

-- Audit Log
CREATE POLICY audit_log_select ON audit_log FOR SELECT USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));
```

---

## Database Functions and Triggers

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orgs_updated_at BEFORE UPDATE ON orgs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_org_members_updated_at BEFORE UPDATE ON org_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_schematics_updated_at BEFORE UPDATE ON schematics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_components_updated_at BEFORE UPDATE ON components FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_component_library_updated_at BEFORE UPDATE ON component_library FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pcb_layouts_updated_at BEFORE UPDATE ON pcb_layouts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_design_rules_updated_at BEFORE UPDATE ON design_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bom_items_updated_at BEFORE UPDATE ON bom_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Audit logging
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (org_id, user_id, action, resource_type, resource_id, old_data, new_data)
    VALUES (
        COALESCE(NEW.org_id, OLD.org_id),
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_projects_audit AFTER INSERT OR UPDATE OR DELETE ON projects FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_exports_audit AFTER INSERT ON exports FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_subscriptions_audit AFTER UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_org_members_audit AFTER INSERT OR DELETE ON org_members FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Auto-generate BOM from schematic components
CREATE OR REPLACE FUNCTION regenerate_bom(p_project_id UUID)
RETURNS void AS $$
BEGIN
    DELETE FROM bom_items WHERE project_id = p_project_id;
    INSERT INTO bom_items (project_id, org_id, reference_designators, mpn, manufacturer, description, value, footprint, quantity)
    SELECT
        c.project_id,
        c.org_id,
        array_agg(c.reference_designator ORDER BY c.reference_designator),
        COALESCE(cl.mpn, 'UNKNOWN'),
        cl.manufacturer,
        cl.description,
        c.value,
        c.footprint,
        count(*)::INTEGER
    FROM components c
    LEFT JOIN component_library cl ON c.library_component_id = cl.id
    WHERE c.project_id = p_project_id
    GROUP BY c.project_id, c.org_id, cl.mpn, cl.manufacturer, cl.description, c.value, c.footprint;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## TypeScript Interfaces

```typescript
type OrgRole = 'owner' | 'admin' | 'editor' | 'viewer';
type ProjectStatus = 'active' | 'archived' | 'template';
type ComponentCategory = 'resistor' | 'capacitor' | 'ic' | 'connector' | 'discrete' | 'module' | 'sensor' | 'power' | 'inductor' | 'crystal' | 'led' | 'relay' | 'other';
type ComponentAvailability = 'in_stock' | 'low_stock' | 'out_of_stock' | 'eol' | 'unknown';
type QuoteStatus = 'pending' | 'received' | 'accepted' | 'expired';
type ExportFormat = 'gerber' | 'pdf_schematic' | 'svg' | 'bom_csv' | 'bom_excel' | 'bom_pdf' | 'pick_place' | 'step_3d';
type ExportStatus = 'generating' | 'completed' | 'failed';
type SubscriptionTier = 'free' | 'pro' | 'team' | 'enterprise';

interface Org {
  id: string; name: string; slug: string; logo_url: string | null;
  default_units: string; settings: Record<string, unknown>;
  created_at: string; updated_at: string;
}

interface User {
  id: string; email: string; full_name: string; avatar_url: string | null;
  preferences: Record<string, unknown>; created_at: string; updated_at: string;
}

interface OrgMember {
  id: string; org_id: string; user_id: string; role: OrgRole;
  invited_by: string | null; joined_at: string; updated_at: string;
}

interface Project {
  id: string; org_id: string; name: string; description: string | null;
  status: ProjectStatus; board_width_mm: number | null; board_height_mm: number | null;
  layer_count: number; layer_stackup: Array<{ layer: string; type: string; thickness_mm: number }>;
  thumbnail_url: string | null; tags: string[]; version_count: number;
  current_version: string; version_history: Array<{ version: string; created_at: string; note: string }>;
  created_by: string | null; created_at: string; updated_at: string;
}

interface Schematic {
  id: string; project_id: string; org_id: string; sheet_number: number; name: string;
  schematic_data: Record<string, unknown>; net_list: Array<{ net_name: string; pins: string[] }>;
  wire_data: Array<{ start: { x: number; y: number }; end: { x: number; y: number } }>;
  annotations: Array<{ text: string; x: number; y: number }>; created_at: string; updated_at: string;
}

interface Component {
  id: string; schematic_id: string; project_id: string; org_id: string;
  library_component_id: string | null; reference_designator: string;
  value: string | null; footprint: string | null; position_x: number; position_y: number;
  rotation: number; is_mirrored: boolean; pin_assignments: Record<string, string>;
  properties: Record<string, unknown>; created_at: string; updated_at: string;
}

interface ComponentLibraryEntry {
  id: string; org_id: string; mpn: string; manufacturer: string | null;
  description: string | null; category: ComponentCategory; subcategory: string | null;
  symbol_data: Record<string, unknown>; footprint_data: Record<string, unknown>;
  footprint_3d_url: string | null; datasheet_url: string | null;
  parametric_data: Record<string, unknown>; package_type: string | null;
  pin_count: number | null; availability: ComponentAvailability;
  unit_price_usd: number | null; supplier_data: Record<string, unknown>;
  is_custom: boolean; is_favorited: boolean; tags: string[];
  created_by: string | null; created_at: string; updated_at: string;
}

interface PcbLayout {
  id: string; project_id: string; org_id: string; name: string;
  board_outline: Record<string, unknown>; component_placements: Array<Record<string, unknown>>;
  traces: Array<Record<string, unknown>>; vias: Array<Record<string, unknown>>;
  copper_fills: Array<Record<string, unknown>>; dimensions: Array<Record<string, unknown>>;
  layer_visibility: Record<string, boolean>; routing_progress: number;
  auto_route_config: Record<string, unknown>; created_at: string; updated_at: string;
}

interface DesignRule {
  id: string; project_id: string; org_id: string; name: string; is_active: boolean;
  manufacturer_preset: string | null; min_trace_width_mm: number; min_clearance_mm: number;
  min_via_diameter_mm: number; min_via_drill_mm: number; min_annular_ring_mm: number;
  solder_mask_expansion_mm: number; silkscreen_min_width_mm: number;
  board_edge_clearance_mm: number; net_class_rules: Record<string, unknown>;
  custom_rules: Array<Record<string, unknown>>; last_drc_run_at: string | null;
  last_drc_errors: number; last_drc_warnings: number;
  last_drc_results: Array<{ severity: string; message: string; location: { x: number; y: number } }>;
  created_at: string; updated_at: string;
}

interface BomItem {
  id: string; project_id: string; org_id: string; library_component_id: string | null;
  reference_designators: string[]; mpn: string; manufacturer: string | null;
  description: string | null; value: string | null; footprint: string | null;
  quantity: number; unit_price_1: number | null; unit_price_10: number | null;
  unit_price_100: number | null; unit_price_1000: number | null;
  preferred_supplier: string | null; supplier_links: Record<string, string>;
  availability: ComponentAvailability; lead_time_days: number | null;
  alternatives: Array<{ mpn: string; reason: string }>; is_dnp: boolean;
  notes: string | null; created_at: string; updated_at: string;
}

interface ManufacturerQuote {
  id: string; project_id: string; org_id: string; manufacturer: string;
  quantity: number; board_specs: Record<string, unknown>;
  unit_price_usd: number | null; total_price_usd: number | null;
  lead_time_days: number | null; shipping_cost_usd: number | null;
  surface_finish: string | null; board_color: string; status: QuoteStatus;
  quote_url: string | null; order_url: string | null; expires_at: string | null;
  fetched_at: string; created_at: string;
}

interface Export {
  id: string; project_id: string; org_id: string; format: ExportFormat;
  status: ExportStatus; file_url: string | null; file_size_bytes: number | null;
  layers_included: string[] | null; manufacturer_preset: string | null;
  config: Record<string, unknown>; error_message: string | null;
  generated_by: string | null; created_at: string;
}

interface Subscription {
  id: string; org_id: string; tier: SubscriptionTier; status: string;
  stripe_customer_id: string | null; stripe_subscription_id: string | null;
  seats_limit: number; projects_limit: number; layer_limit: number;
  ai_queries_limit: number; current_period_start: string | null;
  current_period_end: string | null; canceled_at: string | null;
  created_at: string; updated_at: string;
}
```

---

## Seed Data

```sql
-- Subscription plans
INSERT INTO subscriptions (id, org_id, tier, status, seats_limit, projects_limit, layer_limit, ai_queries_limit)
VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'free', 'active', 1, 3, 2, 50),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'pro', 'active', 1, 25, 6, 500),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'team', 'active', 10, 999, 6, 5000),
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'enterprise', 'active', 999, 999, 16, 999999);

-- Sample DRC manufacturer presets
INSERT INTO design_rules (project_id, org_id, name, manufacturer_preset, min_trace_width_mm, min_clearance_mm, min_via_diameter_mm, min_via_drill_mm)
VALUES
    ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 'JLCPCB Standard', 'jlcpcb', 0.127, 0.127, 0.45, 0.2),
    ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 'PCBWay Standard', 'pcbway', 0.152, 0.152, 0.45, 0.2),
    ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 'OSHPark', 'oshpark', 0.152, 0.152, 0.508, 0.254);

-- Sample component library entries
INSERT INTO component_library (org_id, mpn, manufacturer, description, category, package_type, pin_count, parametric_data) VALUES
    ('00000000-0000-0000-0000-000000000010', 'ATmega328P-AU', 'Microchip', '8-bit AVR Microcontroller', 'ic', 'TQFP-32', 32, '{"flash_kb": 32, "sram_kb": 2, "clock_mhz": 20, "voltage_min": 1.8, "voltage_max": 5.5}'),
    ('00000000-0000-0000-0000-000000000010', 'AMS1117-3.3', 'AMS', '3.3V 1A LDO Voltage Regulator', 'power', 'SOT-223', 3, '{"vout": 3.3, "iout_ma": 1000, "vin_max": 15, "dropout_mv": 1100}'),
    ('00000000-0000-0000-0000-000000000010', 'ESP32-WROOM-32', 'Espressif', 'WiFi+BLE SoC Module', 'module', 'SMD-38', 38, '{"flash_mb": 4, "wifi": true, "bluetooth": true, "gpio": 34}');

-- Sample project template
INSERT INTO projects (org_id, name, description, status, layer_count, created_by) VALUES
    ('00000000-0000-0000-0000-000000000010', 'Arduino Shield Template', '2-layer Arduino Uno shield template', 'template', 2, NULL),
    ('00000000-0000-0000-0000-000000000010', 'ESP32 Base Board', 'WiFi + BLE ready base board', 'template', 2, NULL),
    ('00000000-0000-0000-0000-000000000010', 'Sensor Breakout', 'I2C/SPI sensor breakout board', 'template', 2, NULL);
```

---

## Migration Strategy

### Naming Convention

```
YYYYMMDDHHMMSS_description.sql
```

### Execution Order

1. Extensions
2. Enums
3. Base tables (orgs, users)
4. Junction tables (org_members)
5. Core design tables (projects, component_library)
6. Schematic tables (schematics, components)
7. PCB tables (pcb_layouts, design_rules)
8. Manufacturing tables (bom_items, manufacturer_quotes, exports)
9. Billing tables (subscriptions)
10. System tables (audit_log)
11. Indexes (including GIN for JSONB columns)
12. RLS policies and helper functions
13. Triggers and database functions
14. Seed data (manufacturer presets, sample components, templates)

Migrations are managed via Supabase CLI and stored in `supabase/migrations/`.

---

*Last updated: February 2026*
