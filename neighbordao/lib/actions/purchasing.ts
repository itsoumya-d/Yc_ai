'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { GroupOrder, OrderItem } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getGroupOrders(
  neighborhoodId: string
): Promise<ActionResult<GroupOrder[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('group_orders')
    .select('*, organizer:users!organizer_id(*)')
    .eq('neighborhood_id', neighborhoodId)
    .order('deadline', { ascending: true });

  if (error) return { error: error.message };
  return { data: data as GroupOrder[] };
}

export async function getGroupOrder(
  id: string
): Promise<ActionResult<GroupOrder & { items: OrderItem[] }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: order, error: orderError } = await supabase
    .from('group_orders')
    .select('*, organizer:users!organizer_id(*)')
    .eq('id', id)
    .single();

  if (orderError) return { error: orderError.message };

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*, user:users!user_id(*)')
    .eq('group_order_id', id);

  if (itemsError) return { error: itemsError.message };

  return {
    data: { ...order, items: items as OrderItem[] } as GroupOrder & { items: OrderItem[] },
  };
}

export async function createGroupOrder(data: {
  neighborhood_id: string;
  title: string;
  description?: string;
  vendor: string;
  deadline: string;
  delivery_date?: string;
  min_order_amount?: number;
}): Promise<ActionResult<GroupOrder>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: order, error } = await supabase
    .from('group_orders')
    .insert({
      ...data,
      organizer_id: user.id,
      status: 'open',
      current_total: 0,
      participant_count: 0,
      description: data.description || null,
      delivery_date: data.delivery_date || null,
      min_order_amount: data.min_order_amount ?? null,
    })
    .select('*, organizer:users!organizer_id(*)')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/purchasing');
  revalidatePath('/dashboard');
  return { data: order as GroupOrder };
}

export async function addOrderItem(data: {
  group_order_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
}): Promise<ActionResult<OrderItem>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const total_price = data.quantity * data.unit_price;

  const { data: item, error: itemError } = await supabase
    .from('order_items')
    .insert({
      ...data,
      user_id: user.id,
      total_price,
      paid: false,
    })
    .select()
    .single();

  if (itemError) return { error: itemError.message };

  // Recalculate totals on the group order
  await recalculateOrderTotals(supabase, data.group_order_id);

  revalidatePath('/purchasing');
  revalidatePath(`/purchasing/${data.group_order_id}`);
  return { data: item as OrderItem };
}

export async function removeOrderItem(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get item first to know group_order_id and verify ownership
  const { data: item, error: fetchError } = await supabase
    .from('order_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError) return { error: fetchError.message };
  if (!item) return { error: 'Item not found or not authorized' };

  const { error: deleteError } = await supabase
    .from('order_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (deleteError) return { error: deleteError.message };

  // Recalculate totals
  await recalculateOrderTotals(supabase, item.group_order_id);

  revalidatePath('/purchasing');
  revalidatePath(`/purchasing/${item.group_order_id}`);
  return {};
}

export async function closeOrder(orderId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('group_orders')
    .update({ status: 'closed' })
    .eq('id', orderId)
    .eq('organizer_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/purchasing');
  revalidatePath(`/purchasing/${orderId}`);
  return {};
}

export async function markDelivered(orderId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('group_orders')
    .update({ status: 'delivered' })
    .eq('id', orderId)
    .eq('organizer_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/purchasing');
  revalidatePath(`/purchasing/${orderId}`);
  return {};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recalculateOrderTotals(supabase: any, groupOrderId: string) {
  const { data: allItems } = await supabase
    .from('order_items')
    .select('total_price, user_id')
    .eq('group_order_id', groupOrderId);

  if (allItems) {
    const currentTotal = allItems.reduce(
      (sum: number, item: { total_price: number }) => sum + item.total_price,
      0
    );
    const uniqueParticipants = new Set(
      allItems.map((item: { user_id: string }) => item.user_id)
    ).size;

    await supabase
      .from('group_orders')
      .update({
        current_total: currentTotal,
        participant_count: uniqueParticipants,
      })
      .eq('id', groupOrderId);
  }
}
