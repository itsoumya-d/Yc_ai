import { cn, getPrintReadinessColor, getPrintReadinessLabel } from '@/lib/utils';
import type { PrintReadiness } from '@/types/database';
import { Search, Star, Download, Box, TrendingUp, Clock, Award } from 'lucide-react';

const featured = [
  { id: 'f1', name: 'Modular Hex Storage System', creator: 'PrintMaster3D', downloads: 12400, rating: 4.9, price: 0, tags: ['storage', 'modular'], readiness: 'ready' as PrintReadiness },
  { id: 'f2', name: 'Articulated Octopus v2', creator: 'MechanicalMind', downloads: 8900, rating: 4.8, price: 0, tags: ['toy', 'articulated'], readiness: 'ready' as PrintReadiness },
  { id: 'f3', name: 'Flexi Rex Dinosaur', creator: 'DragonDesigns', downloads: 23400, rating: 4.9, price: 0, tags: ['toy', 'flexi'], readiness: 'ready' as PrintReadiness },
];

const popular = [
  { id: '1', name: 'Cable Management Tower', creator: 'CleanDesk', downloads: 5670, rating: 4.7, price: 0, tags: ['functional'], readiness: 'ready' as PrintReadiness },
  { id: '2', name: 'Geometric Vase Collection', creator: 'ArtPrints', downloads: 3420, rating: 4.6, price: 2.99, tags: ['decor', 'vase'], readiness: 'ready' as PrintReadiness },
  { id: '3', name: 'Raspberry Pi 5 Case', creator: 'TechCases', downloads: 7890, rating: 4.8, price: 0, tags: ['tech', 'case'], readiness: 'ready' as PrintReadiness },
  { id: '4', name: 'Mechanical Keyboard Keycaps', creator: 'KeyForge', downloads: 4560, rating: 4.5, price: 4.99, tags: ['keyboard', 'custom'], readiness: 'warning' as PrintReadiness },
  { id: '5', name: 'Parametric Lampshade', creator: 'LightWorks', downloads: 2340, rating: 4.4, price: 1.99, tags: ['decor', 'lamp'], readiness: 'ready' as PrintReadiness },
  { id: '6', name: 'Tool Holder Wall Mount', creator: 'ShopOrganizer', downloads: 6780, rating: 4.7, price: 0, tags: ['functional', 'tools'], readiness: 'ready' as PrintReadiness },
  { id: '7', name: 'Plant Pot with Drainage', creator: 'GreenPrint', downloads: 9120, rating: 4.8, price: 0, tags: ['garden', 'planter'], readiness: 'ready' as PrintReadiness },
  { id: '8', name: 'Headphone Stand Pro', creator: 'AudioGear', downloads: 4230, rating: 4.6, price: 1.99, tags: ['audio', 'desk'], readiness: 'ready' as PrintReadiness },
];

const categories = ['All', 'Functional', 'Toys', 'Decor', 'Tech', 'Garden', 'Mechanical'];

export function MarketplaceView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="forge-heading text-lg text-text-primary">Marketplace</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Community designs ready to print</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search marketplace..."
            className="h-9 w-64 rounded-md border border-border-default bg-bg-surface-raised pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-DEFAULT focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          {categories.map((c, i) => (
            <button
              key={c}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs',
                i === 0 ? 'bg-primary-muted text-primary-DEFAULT' : 'border border-border-default text-text-secondary hover:text-text-primary'
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Featured */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-primary-DEFAULT" />
            <h3 className="text-sm font-medium text-text-primary">Featured</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {featured.map((d) => (
              <div key={d.id} className="group cursor-pointer rounded-lg border border-primary-muted bg-bg-surface overflow-hidden hover:border-primary-DEFAULT">
                <div className="flex h-48 items-center justify-center bg-bg-viewport relative">
                  <Box className="h-20 w-20 text-primary-DEFAULT opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="absolute top-2 left-2 rounded bg-primary-DEFAULT px-2 py-0.5 text-[10px] font-medium text-white">Featured</div>
                </div>
                <div className="p-4">
                  <div className="text-sm font-medium text-text-primary">{d.name}</div>
                  <div className="mt-1 text-xs text-text-tertiary">by {d.creator}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary-DEFAULT text-primary-DEFAULT" />
                      <span className="text-xs text-text-primary">{d.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3 text-text-tertiary" />
                      <span className="text-xs text-text-tertiary">{(d.downloads / 1000).toFixed(1)}K</span>
                    </div>
                    <span className="text-xs font-medium text-status-success">Free</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent-DEFAULT" />
            <h3 className="text-sm font-medium text-text-primary">Popular</h3>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {popular.map((d) => (
              <div key={d.id} className="group cursor-pointer rounded-lg border border-border-default bg-bg-surface overflow-hidden hover:border-primary-DEFAULT">
                <div className="flex h-32 items-center justify-center bg-bg-viewport">
                  <Box className="h-12 w-12 text-primary-DEFAULT opacity-20 group-hover:opacity-40 transition-opacity" />
                </div>
                <div className="p-3">
                  <div className="text-xs font-medium text-text-primary">{d.name}</div>
                  <div className="mt-0.5 text-[10px] text-text-tertiary">by {d.creator}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-2.5 w-2.5 fill-primary-DEFAULT text-primary-DEFAULT" />
                      <span className="text-[10px] text-text-primary">{d.rating}</span>
                    </div>
                    <span className={cn('text-[10px] font-medium', d.price > 0 ? 'text-text-primary' : 'text-status-success')}>
                      {d.price > 0 ? `$${d.price}` : 'Free'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
