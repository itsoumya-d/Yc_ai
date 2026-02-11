// ── PCB Layer Types ──
export type PCBLayer =
  | 'F.Cu'
  | 'B.Cu'
  | 'In1.Cu'
  | 'In2.Cu'
  | 'F.Silkscreen'
  | 'B.Silkscreen'
  | 'F.Mask'
  | 'B.Mask'
  | 'Edge.Cuts'
  | 'Drill'
  | 'Courtyard'
  | 'Fabrication';

export type ComponentCategory =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'ic'
  | 'connector'
  | 'discrete'
  | 'sensor'
  | 'power'
  | 'module'
  | 'crystal';

export type DRCViolationSeverity = 'error' | 'warning' | 'info';

export type ProjectStatus = 'draft' | 'in_progress' | 'review' | 'manufacturing' | 'completed';

export type ExportFormat = 'gerber' | 'pdf' | 'svg' | 'csv' | 'excel' | 'step' | 'stl';

export type EditorTool =
  | 'select'
  | 'wire'
  | 'bus'
  | 'net_label'
  | 'power'
  | 'no_connect'
  | 'route'
  | 'via'
  | 'copper_fill'
  | 'dimension'
  | 'measure';

export type WorkspaceTab = 'schematic' | 'pcb' | 'bom' | 'export' | '3d';

// ── Core Interfaces ──

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  org_id: string | null;
  plan: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  seats_used: number;
  seats_limit: number;
  created_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  org_id: string | null;
  name: string;
  description: string | null;
  board_params: BoardParams;
  status: ProjectStatus;
  layer_count: number;
  component_count: number;
  version: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface BoardParams {
  width_mm: number;
  height_mm: number;
  layer_count: number;
  min_trace_width_mm: number;
  min_clearance_mm: number;
  min_via_drill_mm: number;
  surface_finish: 'HASL' | 'ENIG' | 'OSP' | 'HASL_lead_free';
  solder_mask_color: 'green' | 'red' | 'blue' | 'black' | 'white' | 'yellow';
  silkscreen_color: 'white' | 'black';
  board_thickness_mm: number;
}

export interface ProjectVersion {
  id: string;
  project_id: string;
  version: number;
  commit_message: string | null;
  author_id: string | null;
  created_at: string;
}

export interface Component {
  id: string;
  mpn: string;
  manufacturer: string | null;
  category: ComponentCategory;
  subcategory: string | null;
  description: string | null;
  package: string | null;
  value: string | null;
  params: Record<string, string | number>;
  datasheet_url: string | null;
  digikey_pn: string | null;
  mouser_pn: string | null;
  lcsc_pn: string | null;
  symbol_file: string | null;
  footprint_file: string | null;
}

export interface SchematicComponent {
  id: string;
  component_id: string;
  ref_designator: string;
  x: number;
  y: number;
  rotation: number;
  mirrored: boolean;
  value: string | null;
  pins: SchematicPin[];
}

export interface SchematicPin {
  number: number;
  name: string;
  x: number;
  y: number;
  connected_net: string | null;
}

export interface Net {
  id: string;
  name: string;
  pins: Array<{ component_ref: string; pin_number: number }>;
  net_class: string;
}

export interface PCBComponent {
  id: string;
  component_id: string;
  ref_designator: string;
  x_mm: number;
  y_mm: number;
  rotation: number;
  layer: 'F.Cu' | 'B.Cu';
  locked: boolean;
}

export interface Trace {
  id: string;
  net_id: string;
  layer: PCBLayer;
  width_mm: number;
  points: Array<{ x: number; y: number }>;
}

export interface Via {
  id: string;
  net_id: string;
  x_mm: number;
  y_mm: number;
  drill_mm: number;
  pad_mm: number;
  start_layer: PCBLayer;
  end_layer: PCBLayer;
}

export interface DRCViolation {
  id: string;
  type: string;
  severity: DRCViolationSeverity;
  message: string;
  location: { x: number; y: number };
  details: string;
  suggestion: string | null;
  ignored: boolean;
}

export interface BOMEntry {
  id: string;
  project_id: string;
  component_id: string;
  reference_designator: string;
  quantity: number;
  unit_price: number | null;
  extended_price: number | null;
  supplier: string | null;
  supplier_pn: string | null;
  in_stock: number | null;
  component: Component;
}

export interface ManufacturerQuote {
  manufacturer: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  lead_time_days: number;
  shipping_cost: number;
  currency: string;
}

export interface AIInteraction {
  id: string;
  user_id: string;
  project_id: string | null;
  prompt: string;
  response: string;
  model: string;
  tokens_used: number;
  feedback: 'positive' | 'negative' | null;
  created_at: string;
}

export interface DesignRule {
  id: string;
  name: string;
  preset: string;
  min_trace_width_mm: number;
  min_clearance_mm: number;
  min_via_drill_mm: number;
  min_via_pad_mm: number;
  min_hole_to_hole_mm: number;
  min_silk_to_mask_mm: number;
  min_edge_clearance_mm: number;
}

export interface LayerConfig {
  layer: PCBLayer;
  visible: boolean;
  opacity: number;
  color: string;
  locked: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  layer_count: number;
  component_count: number;
  preview_url: string | null;
}
