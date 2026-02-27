import { z } from 'zod';

// ============================================================
// Auth Schemas
// ============================================================

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Name is required').max(200).optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInInput = z.infer<typeof signInSchema>;

// ============================================================
// Product Schema
// ============================================================

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  sku: z.string().max(100).nullable().optional(),
  barcode: z.string().max(100).nullable().optional(),
  category_id: z.string().uuid('Invalid category').nullable().optional(),
  unit: z.enum(['each', 'case', 'lb', 'oz', 'kg', 'g', 'liter', 'gallon']).default('each'),
  reorder_point: z.number().int().min(0, 'Reorder point must be 0 or more').default(10),
  reorder_quantity: z.number().int().min(1, 'Reorder quantity must be at least 1').default(20),
  price_cents: z.number().int().min(0).nullable().optional(),
  cost_cents: z.number().int().min(0).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

// ============================================================
// Inventory Schema
// ============================================================

export const inventorySchema = z.object({
  product_id: z.string().uuid('Invalid product'),
  location_id: z.string().uuid('Invalid location'),
  quantity: z.number().int().min(0, 'Quantity must be 0 or more'),
  expiration_date: z.string().nullable().optional(),
  lot_number: z.string().max(100).nullable().optional(),
});

export type InventoryInput = z.infer<typeof inventorySchema>;

// ============================================================
// Scan Schema
// ============================================================

export const scanSchema = z.object({
  scan_type: z.enum(['full_count', 'spot_check', 'receiving']),
  location_id: z.string().uuid('Invalid location').nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type ScanInput = z.infer<typeof scanSchema>;

export const scanItemSchema = z.object({
  scan_id: z.string().uuid('Invalid scan'),
  product_id: z.string().uuid('Invalid product'),
  counted_quantity: z.number().int().min(0, 'Counted quantity must be 0 or more'),
  notes: z.string().max(500).nullable().optional(),
});

export type ScanItemInput = z.infer<typeof scanItemSchema>;

// ============================================================
// Purchase Order Schema
// ============================================================

export const poLineItemSchema = z.object({
  product_id: z.string().uuid('Invalid product'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unit_cost_cents: z.number().int().min(0, 'Unit cost must be 0 or more'),
});

export type PoLineItemInput = z.infer<typeof poLineItemSchema>;

export const purchaseOrderSchema = z.object({
  supplier_id: z.string().uuid('Invalid supplier'),
  items: z.array(poLineItemSchema).min(1, 'At least one item is required'),
  notes: z.string().max(2000).nullable().optional(),
  expected_delivery: z.string().nullable().optional(),
});

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;

// ============================================================
// Supplier Schema
// ============================================================

export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(200),
  contact_name: z.string().max(200).nullable().optional(),
  email: z.string().email('Invalid email').nullable().optional().or(z.literal('')),
  phone: z.string().max(30).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;

// ============================================================
// Alert Settings Schema
// ============================================================

export const alertSettingsSchema = z.object({
  low_stock_threshold: z.number().int().min(1).max(1000).default(10),
  expiration_warning_days: z.number().int().min(1).max(365).default(7),
  push_opted_in: z.boolean().default(true),
  email_opted_in: z.boolean().default(true),
});

export type AlertSettingsInput = z.infer<typeof alertSettingsSchema>;

// ============================================================
// Profile Schema
// ============================================================

export const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(200),
  phone: z.string().max(30).nullable().optional(),
  push_opted_in: z.boolean().default(true),
  email_opted_in: z.boolean().default(true),
});

export type ProfileInput = z.infer<typeof profileSchema>;
