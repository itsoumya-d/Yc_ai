'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ShoppingCart, Users, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { cn, formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import type { GroupOrder } from '@/types/database';

const DEMO_ORDERS: GroupOrder[] = [
  {
    id: 'o1', neighborhood_id: 'n1', organizer_id: 'u1',
    title: 'Spring Mulch Bulk Order', vendor: 'Home Depot', status: 'open',
    target_households: 10, current_households: 8, total_amount: 680,
    deadline: new Date(Date.now() + 3 * 86_400_000).toISOString(),
    estimated_delivery: new Date(Date.now() + 10 * 86_400_000).toISOString(),
    ai_suggestion: 'Adding 2 more bags of brown mulch would hit the next price break at Home Depot, saving $1.50/bag for all participants.',
    description: 'Premium and red mulch for spring landscaping. Includes delivery fee split.',
    created_at: '', organizer: { id: 'u1', full_name: 'David K.', display_name: 'David K.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
  },
  {
    id: 'o2', neighborhood_id: 'n1', organizer_id: 'u2',
    title: 'Shared Lawn Care Contract – Season 2025', vendor: 'GreenCut Landscaping', status: 'locked',
    target_households: 14, current_households: 14, total_amount: 350,
    deadline: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    estimated_delivery: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    ai_suggestion: null,
    description: 'Monthly lawn mowing service for 14 households. Next service March 15.',
    created_at: '', organizer: { id: 'u2', full_name: 'Lisa R.', display_name: 'Lisa R.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
  },
  {
    id: 'o3', neighborhood_id: 'n1', organizer_id: 'u3',
    title: 'Pool Chemicals — Summer Pack', vendor: 'Leslie\'s Pool Supply', status: 'completed',
    target_households: 6, current_households: 6, total_amount: 420,
    deadline: new Date(Date.now() - 30 * 86_400_000).toISOString(),
    estimated_delivery: new Date(Date.now() - 22 * 86_400_000).toISOString(),
    ai_suggestion: null, description: 'Chemical bundle for 6 pool owners. Saved ~$42 per household.',
    created_at: '', organizer: { id: 'u3', full_name: 'Mike T.', display_name: 'Mike T.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
  },
];

const STATUS_LABELS: Record<string, string> = {
  open: 'Open', locked: 'Locked — payment collection', ordered: 'Order placed',
  delivered: 'Delivered', completed: 'Completed', cancelled: 'Cancelled',
};

function OrderCard({ order }: { order: GroupOrder }) {
  const progress = (order.current_households / order.target_households) * 100;
  const perHousehold = order.current_households > 0 ? order.total_amount / order.current_households : 0;
  const statusColor = getStatusColor(order.status);
  const deadline = new Date(order.deadline);
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / 86_400_000);

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            {order.title}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Users className="h-3.5 w-3.5" />
            Organized by {order.organizer?.display_name}
            <span>·</span>
            {order.vendor}
          </div>
        </div>
        <span
          className="shrink-0 rounded-[6px] px-2.5 py-0.5 text-xs font-semibold text-white"
          style={{ background: statusColor }}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Progress bar */}
      {order.status === 'open' && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>
              {order.current_households}/{order.target_households} households joined
            </span>
            <span className="font-medium" style={{ color: '#16A34A' }}>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--bg-subtle)' }}>
            <div
              className="h-full rounded-full bg-[#16A34A] transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 text-sm">
        <span style={{ color: 'var(--text-secondary)' }}>
          Total: <span className="font-semibold" style={{ color: '#CA8A04' }}>{formatCurrency(order.total_amount)}</span>
        </span>
        {order.current_households > 0 && (
          <span style={{ color: 'var(--text-secondary)' }}>
            Per household: <span className="font-semibold" style={{ color: '#CA8A04' }}>~{formatCurrency(perHousehold)}</span>
          </span>
        )}
        {order.status === 'open' && daysLeft > 0 && (
          <span className={cn('flex items-center gap-1', daysLeft <= 1 ? 'text-[#F59E0B]' : 'text-[var(--text-secondary)]')}>
            <Clock className="h-3.5 w-3.5" />
            {daysLeft}d left
          </span>
        )}
      </div>

      {/* AI Suggestion */}
      {order.ai_suggestion && (
        <div className="mt-3 flex gap-2 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3 text-sm" style={{ color: '#15803D' }}>
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{order.ai_suggestion}</span>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {order.status === 'open' && (
          <button className="flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15803D] active:scale-[0.97]">
            Join Order
          </button>
        )}
        <Link
          href={`/purchasing/${order.id}`}
          className="flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-subtle)]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          View Details <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function PurchasingPage() {
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const active = DEMO_ORDERS.filter(o => ['open', 'locked', 'ordered', 'delivered'].includes(o.status));
  const past = DEMO_ORDERS.filter(o => ['completed', 'cancelled'].includes(o.status));

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            Group Purchasing
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Save 30–40% by ordering together
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#15803D] active:scale-[0.97]">
          <Plus className="h-4 w-4" /> New Order
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex border-b" style={{ borderColor: 'var(--border)' }}>
        {(['active', 'past'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium capitalize transition-colors',
              tab === t
                ? 'border-b-2 border-[#16A34A] text-[#16A34A]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            )}>
            {t === 'active' ? `Active Orders (${active.length})` : `Past Orders (${past.length})`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {(tab === 'active' ? active : past).map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
        {tab === 'active' && active.length === 0 && (
          <div className="rounded-2xl border bg-white py-16 text-center" style={{ borderColor: 'var(--border)' }}>
            <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-[var(--text-tertiary)]" />
            <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>No active group orders</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>Start an order to save with your neighbors</p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#15803D]">
              <Plus className="h-4 w-4" /> Create First Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
