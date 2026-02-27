import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getNeighborhood } from '@/lib/actions/neighborhood';
import { getGroupOrders } from '@/lib/actions/group-orders';
import { GroupOrder, OrderStatus } from '@/types/database';
import Link from 'next/link';

function timeUntil(dateStr: string): string {
  const deadline = new Date(dateStr);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

const statusStyles: Record<OrderStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-green-100 text-green-700' },
  minimum_met: { label: 'Min Met', className: 'bg-blue-100 text-blue-700' },
  ordering: { label: 'Ordering', className: 'bg-amber-100 text-amber-700' },
  delivered: { label: 'Delivered', className: 'bg-gray-100 text-gray-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
};

function OrderCard({ order }: { order: GroupOrder }) {
  const progress = Math.min((order.current_units / order.minimum_units) * 100, 100);
  const status = statusStyles[order.status] ?? statusStyles.open;

  return (
    <div className="bg-white rounded-xl border border-green-100 p-5 hover:border-green-200 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-green-900 truncate">{order.title}</h3>
          <p className="text-sm text-green-600">{order.vendor_name}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
      </div>

      {order.description && (
        <p className="text-sm text-green-700 mb-3 line-clamp-2">{order.description}</p>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-green-700">
          <span>${order.unit_price.toFixed(2)} per unit</span>
          <span>{order.current_units} / {order.minimum_units} units</span>
        </div>
        <div className="w-full bg-green-100 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-green-500">
          <span>Total: ${order.total_amount.toFixed(2)}</span>
          <span>{timeUntil(order.deadline)}</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-green-500">
        Organized by {order.organizer_name}
      </div>
    </div>
  );
}

export default async function GroupPurchasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const neighborhood = await getNeighborhood();
  if (!neighborhood) redirect('/onboarding');

  const orders = await getGroupOrders(neighborhood.id);
  const activeOrders = orders.filter((o) => ['open', 'minimum_met', 'ordering'].includes(o.status));
  const pastOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Group Purchases</h1>
          <p className="text-green-600 text-sm mt-1">Coordinate bulk buying with your neighbors</p>
        </div>
        <Link
          href="/group-purchases/new"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Create Order
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-green-800 mb-3">Active Orders</h2>
        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-green-100 p-8 text-center">
            <p className="text-green-600">No active orders. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </section>

      {pastOrders.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-green-800 mb-3">Past Orders</h2>
          <div className="space-y-3">
            {pastOrders.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
        </section>
      )}
    </div>
  );
}
