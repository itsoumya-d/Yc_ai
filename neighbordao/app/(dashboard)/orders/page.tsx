import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('user_profiles').select('neighborhood_id').eq('id', user!.id).single();

  const { data: orders } = await supabase
    .from('group_orders')
    .select('*')
    .eq('neighborhood_id', profile?.neighborhood_id ?? '')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Group Orders</h1>
        <Link href="/orders/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          + New Order
        </Link>
      </div>

      {(!orders || orders.length === 0) ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">🛒</p>
          <h3 className="font-semibold text-slate-900 mb-1">No group orders yet</h3>
          <p className="text-slate-600 text-sm">Start a group order to save money with your neighbors.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{order.title}</h3>
                  <p className="text-sm text-slate-500">via {order.vendor}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  order.status === 'open' ? 'bg-green-100 text-green-700' :
                  order.status === 'fulfilled' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}>{order.status}</span>
              </div>
              {order.description && <p className="text-sm text-slate-600 mb-3">{order.description}</p>}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">👥 {order.participant_count} participants</span>
                <span className="text-slate-500">📅 Closes {formatDate(order.deadline)}</span>
                {order.total_cost > 0 && <span className="font-semibold text-slate-900">${order.total_cost.toFixed(2)} total</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
