'use client';

import { useState } from 'react';
import { Plus, Search, Star, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Resource } from '@/types/database';

const DEMO_RESOURCES: (Resource & { nextAvailable?: string; rating?: number; reviewCount?: number })[] = [
  {
    id: 'r1', neighborhood_id: 'n1', owner_id: 'u1',
    name: 'Pressure Washer (3100 PSI)', category: 'equipment',
    description: 'Gas-powered pressure washer with multiple nozzles. Great for driveways, decks, and siding.',
    condition: 'good', deposit_amount: 20, image_urls: [], is_available: true, created_at: '',
    owner: { id: 'u1', full_name: 'Mike T.', display_name: 'Mike T.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
    rating: 4.8, reviewCount: 12,
  },
  {
    id: 'r2', neighborhood_id: 'n1', owner_id: 'u2',
    name: 'Extension Ladder (24 ft)', category: 'tools',
    description: 'Aluminum extension ladder, rated 300 lbs. Great for gutters and exterior work.',
    condition: 'good', deposit_amount: 0, image_urls: [], is_available: false, created_at: '',
    nextAvailable: new Date(Date.now() + 3 * 86_400_000).toISOString(),
    owner: { id: 'u2', full_name: 'Tom H.', display_name: 'Tom H.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
    rating: 4.6, reviewCount: 8,
  },
  {
    id: 'r3', neighborhood_id: 'n1', owner_id: 'community',
    name: 'Parking Space #4', category: 'spaces',
    description: 'Community-owned covered parking space available weekdays. Near the park entrance.',
    condition: 'excellent', deposit_amount: 0, image_urls: [], is_available: true, created_at: '',
    owner: { id: 'community', full_name: 'Community', display_name: 'Community', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
    rating: 5.0, reviewCount: 3,
  },
  {
    id: 'r4', neighborhood_id: 'n1', owner_id: 'u4',
    name: 'Riding Lawn Mower', category: 'equipment',
    description: 'John Deere E110. Best for large lawns. Full tank, clean blades.',
    condition: 'good', deposit_amount: 40, image_urls: [], is_available: true, created_at: '',
    owner: { id: 'u4', full_name: 'Ann P.', display_name: 'Ann P.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
    rating: 4.9, reviewCount: 6,
  },
  {
    id: 'r5', neighborhood_id: 'n1', owner_id: 'u5',
    name: 'Pickup Truck (F-150)', category: 'vehicles',
    description: 'Happy to lend for big moves or dump runs. Prefer return with full tank.',
    condition: 'good', deposit_amount: 50, image_urls: [], is_available: false, created_at: '',
    nextAvailable: new Date(Date.now() + 5 * 86_400_000).toISOString(),
    owner: { id: 'u5', full_name: 'Jim W.', display_name: 'Jim W.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
    rating: 4.7, reviewCount: 9,
  },
  {
    id: 'r6', neighborhood_id: 'n1', owner_id: 'community',
    name: 'Projector + Screen', category: 'equipment',
    description: 'Community-owned. 4K projector + 100" screen. Perfect for outdoor movie nights.',
    condition: 'excellent', deposit_amount: 0, image_urls: [], is_available: true, created_at: '',
    owner: { id: 'community', full_name: 'Community', display_name: 'Community', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
    rating: 5.0, reviewCount: 4,
  },
];

const FILTERS = ['All', 'Tools', 'Equipment', 'Spaces', 'Vehicles'] as const;
const CATEGORY_MAP: Record<string, Resource['category']> = {
  Tools: 'tools', Equipment: 'equipment', Spaces: 'spaces', Vehicles: 'vehicles',
};

const CONDITION_COLORS = {
  excellent: { bg: '#F0FDF4', text: '#15803D' },
  good: { bg: '#EFF6FF', text: '#1D4ED8' },
  fair: { bg: '#FEF9C3', text: '#A16207' },
};

function ResourceCard({ resource }: { resource: typeof DEMO_RESOURCES[0] }) {
  const cond = CONDITION_COLORS[resource.condition];
  return (
    <div className="group rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md" style={{ borderColor: 'var(--border)' }}>
      {/* Photo placeholder */}
      <div className="relative h-40 w-full overflow-hidden rounded-t-2xl bg-[#F5F5F4] flex items-center justify-center">
        <span className="text-4xl">
          {resource.category === 'tools' ? '🔧' : resource.category === 'equipment' ? '🏗️' : resource.category === 'spaces' ? '🅿️' : resource.category === 'vehicles' ? '🚛' : '📦'}
        </span>
        <div className={cn(
          'absolute top-3 right-3 rounded-full px-2 py-0.5 text-xs font-semibold',
          resource.is_available ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEF9C3] text-[#A16207]',
        )}>
          {resource.is_available ? 'Available' : 'Booked'}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
          {resource.name}
        </h3>
        <div className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          Owner: {resource.owner?.display_name}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-[4px] px-1.5 py-0.5 text-xs font-medium" style={{ background: cond.bg, color: cond.text }}>
            {resource.condition.charAt(0).toUpperCase() + resource.condition.slice(1)}
          </span>
          {resource.deposit_amount > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              ${resource.deposit_amount} deposit
            </span>
          )}
          {resource.deposit_amount === 0 && (
            <span className="text-xs font-medium text-[#16A34A]">Free</span>
          )}
        </div>

        {resource.rating && (
          <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <Star className="h-3.5 w-3.5 fill-[#CA8A04] text-[#CA8A04]" />
            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{resource.rating}</span>
            <span>({resource.reviewCount} reviews)</span>
          </div>
        )}

        {!resource.is_available && resource.nextAvailable && (
          <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <Calendar className="h-3.5 w-3.5" />
            Available {new Date(resource.nextAvailable).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )}

        <button
          className={cn(
            'mt-3 w-full rounded-lg py-2 text-sm font-semibold transition-all active:scale-[0.97]',
            resource.is_available
              ? 'bg-[#16A34A] text-white hover:bg-[#15803D]'
              : 'border text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]',
          )}
          style={!resource.is_available ? { borderColor: 'var(--border)' } : undefined}
        >
          {resource.is_available ? 'Book Now' : 'Join Waitlist'}
        </button>
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<typeof FILTERS[number]>('All');

  const filtered = DEMO_RESOURCES.filter(r => {
    const matchesFilter = filter === 'All' || r.category === CATEGORY_MAP[filter];
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            Shared Resources
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {DEMO_RESOURCES.length} items available to borrow
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#15803D] active:scale-[0.97]">
          <Plus className="h-4 w-4" /> List Item
        </button>
      </div>

      {/* Search + Filter */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="search" placeholder="Search resources..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-base outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
            style={{ borderColor: 'var(--border)', background: 'white', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('rounded-full px-3 py-2 text-sm font-medium transition-all',
                filter === f ? 'bg-[#16A34A] text-white' : 'border bg-white hover:bg-[var(--bg-subtle)]')}
              style={filter !== f ? { borderColor: 'var(--border)', color: 'var(--text-secondary)' } : undefined}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(r => <ResourceCard key={r.id} resource={r} />)}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border bg-white py-16 text-center" style={{ borderColor: 'var(--border)' }}>
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-[var(--text-tertiary)]" />
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>No resources match your search.</p>
        </div>
      )}
    </div>
  );
}
