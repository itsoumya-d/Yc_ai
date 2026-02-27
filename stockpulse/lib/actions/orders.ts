'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, PurchaseOrder } from '@/types/database';
import { purchaseOrderSchema } from '@/lib/validations/schemas';

export async function fetchOrders(status?: string): Promise<ActionResult<PurchaseOrder[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: memberData } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!memberData) return { success: false, error: 'No organization found' };

    let query = supabase
      .from('purchase_orders')
      .select('*, supplier:suppliers(*), line_items:po_line_items(*, product:products(*))')
      .eq('org_id', memberData.org_id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as PurchaseOrder[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchOrder(id: string): Promise<ActionResult<PurchaseOrder>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, supplier:suppliers(*), line_items:po_line_items(*, product:products(*))')
      .eq('id', id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as PurchaseOrder };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createOrder(data: {
  supplier_id: string;
  items: Array<{ product_id: string; quantity: number; unit_cost_cents: number }>;
  notes?: string | null;
  expected_delivery?: string | null;
}): Promise<ActionResult<PurchaseOrder>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: memberData } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!memberData) return { success: false, error: 'No organization found' };

    const parsed = purchaseOrderSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const totalCents = parsed.data.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_cost_cents,
      0
    );

    const orderNumber = `PO-${Date.now().toString(36).toUpperCase()}`;

    const { data: order, error: orderError } = await supabase
      .from('purchase_orders')
      .insert({
        org_id: memberData.org_id,
        supplier_id: parsed.data.supplier_id,
        order_number: orderNumber,
        status: 'draft',
        total_cents: totalCents,
        notes: parsed.data.notes ?? null,
        expected_delivery: parsed.data.expected_delivery ?? null,
        created_by: user.id,
      })
      .select()
      .single();

    if (orderError) return { success: false, error: orderError.message };

    const lineItems = parsed.data.items.map((item) => ({
      po_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_cost_cents: item.unit_cost_cents,
      total_cents: item.quantity * item.unit_cost_cents,
    }));

    const { error: lineError } = await supabase
      .from('po_line_items')
      .insert(lineItems);

    if (lineError) return { success: false, error: lineError.message };

    return { success: true, data: order as PurchaseOrder };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<ActionResult<PurchaseOrder>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const updateData: Record<string, unknown> = { status };

    if (status === 'submitted') {
      updateData.submitted_at = new Date().toISOString();
    } else if (status === 'received') {
      updateData.received_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('purchase_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as PurchaseOrder };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
