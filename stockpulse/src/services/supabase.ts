import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Type helpers matching DB schema ────────────────────────────────────────

export interface DBOrganization {
  id: string;
  name: string;
  business_type: string | null;
  settings: Record<string, unknown> | null;
  created_at: string;
}

export interface DBLocation {
  id: string;
  org_id: string;
  name: string;
  address: string | null;
  timezone: string | null;
  created_at: string;
}

export interface DBProduct {
  id: string;
  org_id: string;
  name: string;
  sku: string;
  category_id: string | null;
  brand: string | null;
  unit: string;
  description: string | null;
  image_url: string | null;
  barcode: string | null;
  created_at: string;
}

export interface DBInventory {
  id: string;
  product_id: string;
  location_id: string;
  current_stock: number;
  reorder_point: number;
  max_stock: number;
  cost_per_unit: number | null;
  last_counted_at: string | null;
}

export interface DBScanSession {
  id: string;
  location_id: string;
  scanned_by: string;
  scan_type: string;
  barcode: string | null;
  product_id: string | null;
  quantity_change: number;
  notes: string | null;
  scanned_at: string;
}

export interface DBStockAlert {
  id: string;
  inventory_id: string;
  alert_type: string;
  severity: string;
  acknowledged: boolean;
  created_at: string;
}

export interface DBPurchaseOrder {
  id: string;
  org_id: string;
  location_id: string;
  status: string;
  items: unknown[];
  generated_by: string;
  created_at: string;
}

// ─── Query helpers ───────────────────────────────────────────────────────────

export async function fetchInventoryForLocation(locationId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      products (
        id, name, sku, brand, unit, description, image_url, barcode,
        product_categories ( id, name, color )
      )
    `)
    .eq('location_id', locationId)
    .order('products(name)');

  if (error) throw error;
  return data;
}

export async function fetchLowStockAlerts(locationId: string) {
  const { data, error } = await supabase
    .from('stock_alerts')
    .select(`
      *,
      inventory (
        current_stock, reorder_point,
        products ( name, sku, brand, unit )
      )
    `)
    .eq('inventory.location_id', locationId)
    .eq('acknowledged', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function upsertInventoryStock(
  productId: string,
  locationId: string,
  stockDelta: number,
  scanType: string,
  userId: string,
  notes?: string
) {
  const { error } = await supabase.from('scan_sessions').insert({
    location_id: locationId,
    scanned_by: userId,
    scan_type: scanType,
    product_id: productId,
    quantity_change: stockDelta,
    notes: notes ?? null,
    scanned_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function insertProduct(
  orgId: string,
  product: Omit<DBProduct, 'id' | 'created_at'>
) {
  const { data, error } = await supabase
    .from('products')
    .insert({ ...product, org_id: orgId })
    .select()
    .single();
  if (error) throw error;
  return data as DBProduct;
}

export async function insertInventoryRecord(record: Omit<DBInventory, 'id'>) {
  const { data, error } = await supabase
    .from('inventory')
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  return data as DBInventory;
}

export async function savePurchaseOrder(
  orgId: string,
  locationId: string,
  userId: string,
  items: unknown[]
) {
  const { data, error } = await supabase
    .from('purchase_orders')
    .insert({
      org_id: orgId,
      location_id: locationId,
      status: 'draft',
      items,
      generated_by: userId,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as DBPurchaseOrder;
}
