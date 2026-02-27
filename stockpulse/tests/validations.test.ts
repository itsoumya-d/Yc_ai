import { describe, it, expect } from 'vitest';
import {
  signUpSchema,
  signInSchema,
  productSchema,
  inventorySchema,
  scanSchema,
  scanItemSchema,
  purchaseOrderSchema,
  supplierSchema,
  alertSettingsSchema,
  profileSchema,
} from '@/lib/validations/schemas';

// ─── signUpSchema ───────────────────────────────────
describe('signUpSchema', () => {
  it('accepts valid signup data', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('accepts signup with full_name', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      full_name: 'John Doe',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({
      email: 'not-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: '1234567',
    });
    expect(result.success).toBe(false);
  });
});

// ─── signInSchema ───────────────────────────────────
describe('signInSchema', () => {
  it('accepts valid credentials', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'any',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'bad',
      password: 'test',
    });
    expect(result.success).toBe(false);
  });
});

// ─── productSchema ──────────────────────────────────
describe('productSchema', () => {
  it('accepts valid product', () => {
    const result = productSchema.safeParse({
      name: 'Tomato Sauce',
      unit: 'each',
      reorder_point: 10,
      reorder_quantity: 20,
    });
    expect(result.success).toBe(true);
  });

  it('accepts product with all fields', () => {
    const result = productSchema.safeParse({
      name: 'Tomato Sauce',
      sku: 'TS-001',
      barcode: '012345678901',
      category_id: '00000000-0000-0000-0000-000000000001',
      unit: 'case',
      reorder_point: 5,
      reorder_quantity: 10,
      price_cents: 299,
      cost_cents: 150,
      description: 'Red tomato sauce',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = productSchema.safeParse({
      name: '',
      unit: 'each',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid unit', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      unit: 'barrel',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative reorder_point', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      reorder_point: -1,
    });
    expect(result.success).toBe(false);
  });

  it('defaults unit to each', () => {
    const result = productSchema.safeParse({ name: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.unit).toBe('each');
  });
});

// ─── inventorySchema ────────────────────────────────
describe('inventorySchema', () => {
  it('accepts valid inventory entry', () => {
    const result = inventorySchema.safeParse({
      product_id: '00000000-0000-0000-0000-000000000001',
      location_id: '00000000-0000-0000-0000-000000000002',
      quantity: 50,
    });
    expect(result.success).toBe(true);
  });

  it('accepts with expiration date', () => {
    const result = inventorySchema.safeParse({
      product_id: '00000000-0000-0000-0000-000000000001',
      location_id: '00000000-0000-0000-0000-000000000002',
      quantity: 10,
      expiration_date: '2025-12-31',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative quantity', () => {
    const result = inventorySchema.safeParse({
      product_id: '00000000-0000-0000-0000-000000000001',
      location_id: '00000000-0000-0000-0000-000000000002',
      quantity: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid product_id', () => {
    const result = inventorySchema.safeParse({
      product_id: 'not-a-uuid',
      location_id: '00000000-0000-0000-0000-000000000002',
      quantity: 10,
    });
    expect(result.success).toBe(false);
  });
});

// ─── scanSchema ─────────────────────────────────────
describe('scanSchema', () => {
  it('accepts valid scan', () => {
    const result = scanSchema.safeParse({
      scan_type: 'full_count',
    });
    expect(result.success).toBe(true);
  });

  it('accepts spot_check', () => {
    const result = scanSchema.safeParse({
      scan_type: 'spot_check',
      location_id: '00000000-0000-0000-0000-000000000001',
    });
    expect(result.success).toBe(true);
  });

  it('accepts receiving', () => {
    const result = scanSchema.safeParse({
      scan_type: 'receiving',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid scan type', () => {
    const result = scanSchema.safeParse({
      scan_type: 'random',
    });
    expect(result.success).toBe(false);
  });
});

// ─── scanItemSchema ─────────────────────────────────
describe('scanItemSchema', () => {
  it('accepts valid scan item', () => {
    const result = scanItemSchema.safeParse({
      scan_id: '00000000-0000-0000-0000-000000000001',
      product_id: '00000000-0000-0000-0000-000000000002',
      counted_quantity: 25,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative counted_quantity', () => {
    const result = scanItemSchema.safeParse({
      scan_id: '00000000-0000-0000-0000-000000000001',
      product_id: '00000000-0000-0000-0000-000000000002',
      counted_quantity: -1,
    });
    expect(result.success).toBe(false);
  });
});

// ─── purchaseOrderSchema ────────────────────────────
describe('purchaseOrderSchema', () => {
  it('accepts valid order', () => {
    const result = purchaseOrderSchema.safeParse({
      supplier_id: '00000000-0000-0000-0000-000000000001',
      items: [
        { product_id: '00000000-0000-0000-0000-000000000002', quantity: 10, unit_cost_cents: 500 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts order with notes', () => {
    const result = purchaseOrderSchema.safeParse({
      supplier_id: '00000000-0000-0000-0000-000000000001',
      items: [
        { product_id: '00000000-0000-0000-0000-000000000002', quantity: 5, unit_cost_cents: 100 },
      ],
      notes: 'Rush order',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty items', () => {
    const result = purchaseOrderSchema.safeParse({
      supplier_id: '00000000-0000-0000-0000-000000000001',
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid supplier_id', () => {
    const result = purchaseOrderSchema.safeParse({
      supplier_id: 'bad',
      items: [
        { product_id: '00000000-0000-0000-0000-000000000002', quantity: 1, unit_cost_cents: 100 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantity in items', () => {
    const result = purchaseOrderSchema.safeParse({
      supplier_id: '00000000-0000-0000-0000-000000000001',
      items: [
        { product_id: '00000000-0000-0000-0000-000000000002', quantity: 0, unit_cost_cents: 100 },
      ],
    });
    expect(result.success).toBe(false);
  });
});

// ─── supplierSchema ─────────────────────────────────
describe('supplierSchema', () => {
  it('accepts valid supplier', () => {
    const result = supplierSchema.safeParse({
      name: 'Acme Foods',
    });
    expect(result.success).toBe(true);
  });

  it('accepts supplier with all fields', () => {
    const result = supplierSchema.safeParse({
      name: 'Acme Foods',
      contact_name: 'John Smith',
      email: 'john@acmefoods.com',
      phone: '+1-555-0123',
      address: '123 Main St',
      notes: 'Preferred vendor',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = supplierSchema.safeParse({
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty email string', () => {
    const result = supplierSchema.safeParse({
      name: 'Test',
      email: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = supplierSchema.safeParse({
      name: 'Test',
      email: 'not-email',
    });
    expect(result.success).toBe(false);
  });
});

// ─── alertSettingsSchema ────────────────────────────
describe('alertSettingsSchema', () => {
  it('accepts valid settings', () => {
    const result = alertSettingsSchema.safeParse({
      low_stock_threshold: 10,
      expiration_warning_days: 7,
      push_opted_in: true,
      email_opted_in: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects zero threshold', () => {
    const result = alertSettingsSchema.safeParse({
      low_stock_threshold: 0,
      expiration_warning_days: 7,
    });
    expect(result.success).toBe(false);
  });

  it('rejects threshold over 1000', () => {
    const result = alertSettingsSchema.safeParse({
      low_stock_threshold: 1001,
      expiration_warning_days: 7,
    });
    expect(result.success).toBe(false);
  });

  it('rejects warning days over 365', () => {
    const result = alertSettingsSchema.safeParse({
      low_stock_threshold: 10,
      expiration_warning_days: 366,
    });
    expect(result.success).toBe(false);
  });

  it('defaults push_opted_in to true', () => {
    const result = alertSettingsSchema.safeParse({
      low_stock_threshold: 10,
      expiration_warning_days: 7,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.push_opted_in).toBe(true);
  });
});

// ─── profileSchema ──────────────────────────────────
describe('profileSchema', () => {
  it('accepts valid profile', () => {
    const result = profileSchema.safeParse({
      full_name: 'John Doe',
    });
    expect(result.success).toBe(true);
  });

  it('accepts profile with phone', () => {
    const result = profileSchema.safeParse({
      full_name: 'Jane Doe',
      phone: '+1-555-0123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = profileSchema.safeParse({
      full_name: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name over 200 chars', () => {
    const result = profileSchema.safeParse({
      full_name: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('defaults push_opted_in to true', () => {
    const result = profileSchema.safeParse({
      full_name: 'Test',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.push_opted_in).toBe(true);
  });
});
