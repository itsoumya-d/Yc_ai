import { ShoppingCart, Plus, Users, Clock, TrendingDown } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStatusColor } from '@/lib/utils';

const tabs = ['Active Orders', 'Past Orders'];

export default function PurchasingPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Group Purchasing
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Save money with bulk neighborhood orders
          </p>
        </div>
        <Button size="md">
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border mb-6">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              i === 0
                ? 'border-leaf-600 text-leaf-700'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <Card padding="lg" className="text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-text-muted mb-4" />
        <h3 className="font-heading text-lg font-bold text-text-primary">
          No active group orders
        </h3>
        <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
          Start a group order to save money on bulk purchases. Coordinate with neighbors on
          mulch delivery, lawn care contracts, and more.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
          <div className="rounded-[var(--radius-card)] bg-leaf-50 p-4 text-center">
            <TrendingDown className="mx-auto h-6 w-6 text-leaf-600 mb-2" />
            <p className="text-xs font-medium text-leaf-700">Save 30-40%</p>
            <p className="text-xs text-leaf-600">on bulk orders</p>
          </div>
          <div className="rounded-[var(--radius-card)] bg-sky-50 p-4 text-center">
            <Users className="mx-auto h-6 w-6 text-sky-600 mb-2" />
            <p className="text-xs font-medium text-sky-700">Split costs</p>
            <p className="text-xs text-sky-600">transparently</p>
          </div>
          <div className="rounded-[var(--radius-card)] bg-earth-50 p-4 text-center">
            <Clock className="mx-auto h-6 w-6 text-earth-600 mb-2" />
            <p className="text-xs font-medium text-earth-700">AI timing</p>
            <p className="text-xs text-earth-600">optimal orders</p>
          </div>
        </div>
        <Button className="mt-6">
          <Plus className="h-4 w-4" />
          Create First Order
        </Button>
      </Card>
    </div>
  );
}
