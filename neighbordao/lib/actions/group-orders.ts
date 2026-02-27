'use server';

import { createClient } from '@/lib/supabase/server';
import { GroupOrder, OrderStatus } from '@/types/database';

export async function getGroupOrders(neighborhoodId: string): Promise<GroupOrder[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('group_orders')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
    .order('deadline', { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function createGroupOrder(data: {
  neighborhood_id: string;
  title: string;
  description: string;
  vendor_name: string;
  unit_price: number;
  minimum_units: number;
  deadline: string;
}): Promise<{ error?: string; order?: GroupOrder }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data: member } = await supabase
    .from('neighborhood_members')
    .select('display_name')
    .eq('user_id', user.id)
    .eq('neighborhood_id', data.neighborhood_id)
    .maybeSingle();

  const organizerName = member?.display_name || user.email?.split('@')[0] || 'Member';

  const { data: order, error } = await supabase
    .from('group_orders')
    .insert({
      neighborhood_id: data.neighborhood_id,
      organizer_id: user.id,
      organizer_name: organizerName,
      title: data.title,
      description: data.description,
      vendor_name: data.vendor_name,
      unit_price: data.unit_price,
      minimum_units: data.minimum_units,
      deadline: data.deadline,
      current_units: 0,
      total_amount: 0,
      status: 'open',
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { order };
}

export async function joinGroupOrder(
  orderId: string,
  units: number
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data: order, error: fetchError } = await supabase
    .from('group_orders')
    .select('current_units, unit_price, minimum_units, status')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) return { error: 'Order not found' };
  if (order.status === 'cancelled' || order.status === 'delivered') {
    return { error: 'Order is no longer accepting participants' };
  }

  const newUnits = order.current_units + units;
  const newTotal = newUnits * order.unit_price;
  const newStatus: OrderStatus = newUnits >= order.minimum_units ? 'minimum_met' : 'open';

  const { error: updateError } = await supabase
    .from('group_orders')
    .update({
      current_units: newUnits,
      total_amount: newTotal,
      status: newStatus,
    })
    .eq('id', orderId);

  if (updateError) return { error: updateError.message };
  return {};
}
