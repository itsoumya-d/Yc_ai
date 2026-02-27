import { ShoppingCart, Plus, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchOrders } from '@/lib/actions/orders';
import { getOrderStatusLabel, formatCurrency, formatDate } from '@/lib/utils';
import type { OrderStatus } from '@/types/database';

const statusTabs: Array<{ label: string; value: string | undefined }> = [
  { label: 'All', value: undefined },
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Received', value: 'received' },
];

function getStatusBadgeVariant(status: string): 'default' | 'green' | 'red' | 'amber' | 'blue' | 'gray' | 'outline' {
  switch (status) {
    case 'draft': return 'gray';
    case 'submitted': return 'blue';
    case 'confirmed': return 'green';
    case 'received': return 'green';
    case 'cancelled': return 'red';
    default: return 'gray';
  }
}

export default async function OrdersPage() {
  const ordersResult = await fetchOrders();
  const orders = ordersResult.success ? ordersResult.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Purchase Orders</h1>
          <p className="text-sm text-text-secondary mt-1">{orders.length} orders</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-electric-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-electric-700 transition-colors">
          <Plus className="h-4 w-4" />
          New Order
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.label}
            className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap border border-border text-text-secondary hover:bg-surface-secondary transition-colors"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <ShoppingCart className="h-10 w-10 text-text-muted mx-auto mb-3" />
            <h3 className="text-base font-medium text-text-primary mb-1">No orders yet</h3>
            <p className="text-sm text-text-secondary mb-4">
              Create your first purchase order to restock inventory.
            </p>
            <button className="inline-flex items-center gap-2 bg-electric-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-electric-700 transition-colors">
              <Plus className="h-4 w-4" />
              Create Order
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} hover>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-text-primary font-mono">{order.order_number}</p>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {order.supplier?.name ?? 'Unknown Supplier'}
                    {order.line_items && ` - ${order.line_items.length} items`}
                  </p>
                  {order.expected_delivery && (
                    <p className="text-xs text-text-muted mt-0.5">
                      Expected: {formatDate(order.expected_delivery)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-primary font-mono">
                    {formatCurrency(order.total_cents)}
                  </p>
                  <p className="text-xs text-text-muted">{formatDate(order.created_at)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
