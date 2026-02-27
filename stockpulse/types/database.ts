// ─── Core Types ──────────────────────────────────────

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';

export type AlertType = 'low_stock' | 'out_of_stock' | 'expiration' | 'reorder';

export type OrderStatus = 'draft' | 'submitted' | 'confirmed' | 'received' | 'cancelled';

export type ScanType = 'full_count' | 'spot_check' | 'receiving';

export type ScanStatus = 'in_progress' | 'completed' | 'cancelled';

export type Unit = 'each' | 'case' | 'lb' | 'oz' | 'kg' | 'g' | 'liter' | 'gallon';

export type MemberRole = 'owner' | 'admin' | 'manager' | 'staff';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export type AlertPriority = 'low' | 'normal' | 'high' | 'urgent';

export type AuditAction =
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'inventory_adjusted'
  | 'scan_completed'
  | 'order_created'
  | 'order_updated'
  | 'supplier_created'
  | 'supplier_updated'
  | 'alert_resolved'
  | 'settings_changed';

// ─── Interfaces ──────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  default_org_id: string | null;
  push_opted_in: boolean;
  email_opted_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: MemberRole;
  invited_email: string | null;
  joined_at: string;
  created_at: string;
}

export interface Product {
  id: string;
  org_id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  category_id: string | null;
  unit: Unit;
  reorder_point: number;
  reorder_quantity: number;
  price_cents: number | null;
  cost_cents: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Category {
  id: string;
  org_id: string | null;
  name: string;
  icon: string | null;
  sort_order: number;
  is_default: boolean;
  created_at: string;
}

export interface InventoryLocation {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string;
  org_id: string;
  product_id: string;
  location_id: string;
  quantity: number;
  expiration_date: string | null;
  lot_number: string | null;
  last_counted_at: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
  location?: InventoryLocation;
}

export interface Scan {
  id: string;
  org_id: string;
  user_id: string;
  scan_type: ScanType;
  status: ScanStatus;
  location_id: string | null;
  items_count: number;
  discrepancies_count: number;
  notes: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  location?: InventoryLocation;
}

export interface ScanItem {
  id: string;
  scan_id: string;
  product_id: string;
  expected_quantity: number | null;
  counted_quantity: number;
  discrepancy: number | null;
  notes: string | null;
  scanned_at: string;
  product?: Product;
}

export interface PurchaseOrder {
  id: string;
  org_id: string;
  supplier_id: string;
  order_number: string;
  status: OrderStatus;
  total_cents: number;
  notes: string | null;
  expected_delivery: string | null;
  submitted_at: string | null;
  received_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  line_items?: PoLineItem[];
}

export interface PoLineItem {
  id: string;
  po_id: string;
  product_id: string;
  quantity: number;
  unit_cost_cents: number;
  total_cents: number;
  received_quantity: number | null;
  created_at: string;
  product?: Product;
}

export interface Supplier {
  id: string;
  org_id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockAlert {
  id: string;
  org_id: string;
  product_id: string;
  alert_type: AlertType;
  priority: AlertPriority;
  message: string;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  product?: Product;
}

export interface ExpirationAlert {
  id: string;
  org_id: string;
  inventory_id: string;
  product_id: string;
  expiration_date: string;
  days_until_expiry: number;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  product?: Product;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price_cents: number;
  cost_cents: number | null;
  effective_date: string;
  created_at: string;
}

export interface BarcodeMapping {
  id: string;
  barcode: string;
  product_id: string;
  source: string | null;
  created_at: string;
}

export interface CountSchedule {
  id: string;
  org_id: string;
  name: string;
  scan_type: ScanType;
  location_id: string | null;
  frequency_days: number;
  next_count_date: string;
  last_count_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionEvent {
  id: string;
  org_id: string;
  event_type: string;
  stripe_event_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  org_id: string;
  user_id: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  changes: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

// ─── Action Result ───────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
