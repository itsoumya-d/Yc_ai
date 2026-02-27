'use server';

import { createClient } from '@/lib/supabase/server';
import { groupOrderSchema, orderItemSchema } from '@/lib/validations/schemas';
import type { ActionResult, GroupOrder, OrderItem } from '@/types/database';

export async function fetchGroupOrders(
  neighborhoodId: string,
  status?: 'active' | 'past'
): Promise<ActionResult<GroupOrder[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  let query = supabase
    .from('group_orders')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
    .order('created_at', { ascending: false });

  if (status === 'active') {
    query = query.in('status', ['open', 'locked', 'ordered']);
  } else if (status === 'past') {
    query = query.in('status', ['delivered', 'completed', 'cancelled']);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true, data: data as GroupOrder[] };
}

export async function fetchGroupOrder(orderId: string): Promise<ActionResult<GroupOrder>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('group_orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as GroupOrder };
}

export async function createGroupOrder(
  neighborhoodId: string,
  formData: FormData
): Promise<ActionResult<GroupOrder>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const raw = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    vendor_name: formData.get('vendor_name') as string,
    vendor_contact: (formData.get('vendor_contact') as string) || null,
    min_participants: Number(formData.get('min_participants')) || 1,
    max_participants: formData.get('max_participants') ? Number(formData.get('max_participants')) : null,
    delivery_fee: Number(formData.get('delivery_fee')) || 0,
    estimated_savings_percent: formData.get('estimated_savings_percent') ? Number(formData.get('estimated_savings_percent')) : null,
    deadline: formData.get('deadline') as string,
    estimated_delivery: (formData.get('estimated_delivery') as string) || null,
  };

  const parsed = groupOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from('group_orders')
    .insert({
      neighborhood_id: neighborhoodId,
      organizer_id: user.id,
      ...parsed.data,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as GroupOrder };
}

export async function joinOrder(
  orderId: string,
  formData: FormData
): Promise<ActionResult<OrderItem>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const raw = {
    item_name: formData.get('item_name') as string,
    quantity: Number(formData.get('quantity')) || 1,
    unit_price: Number(formData.get('unit_price')) || 0,
    notes: (formData.get('notes') as string) || null,
  };

  const parsed = orderItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const totalPrice = parsed.data.quantity * parsed.data.unit_price;

  const { data, error } = await supabase
    .from('order_items')
    .insert({
      group_order_id: orderId,
      user_id: user.id,
      ...parsed.data,
      total_price: totalPrice,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as OrderItem };
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('group_orders')
    .update({ status })
    .eq('id', orderId)
    .eq('organizer_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}
