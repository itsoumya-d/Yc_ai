import Link from 'next/link';
import { Scissors, PawPrint, Moon, Dumbbell, Plus, Star, MapPin, Shield, TrendingUp } from 'lucide-react';
import { getMarketplaceListings } from '@/lib/actions/marketplace';

const SERVICE_CONFIG: Record<string, { label: string; icon: typeof PawPrint; color: string; bg: string }> = {
  grooming:      { label: 'Grooming',     icon: Scissors,  color: 'text-pink-600',   bg: 'bg-pink-50 dark:bg-pink-900/20' },
  dog_walking:   { label: 'Dog Walking',  icon: PawPrint,  color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  pet_sitting:   { label: 'Pet Sitting',  icon: Moon,      color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  boarding:      { label: 'Boarding',     icon: Moon,      color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  training:      { label: 'Training',     icon: Dumbbell,  color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  other:         { label: 'Other',        icon: PawPrint,  color: 'text-gray-600',   bg: 'bg-gray-50 dark:bg-gray-800' },
};

const CATEGORY_FILTERS = ['all', 'grooming', 'dog_walking', 'pet_sitting', 'boarding', 'training'];

function PriceTypeBadge({ priceType }: { priceType: string }) {
  const map: Record<string, string> = {
    hourly: '/hr', flat: '/visit', per_night: '/night', per_session: '/session',
  };
  return <span className="text-gray-400 dark:text-gray-500 text-sm">{map[priceType] ?? ''}</span>;
}

export default async function ServicesMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; booked?: string }>;
}) {
  const sp = await searchParams;
  const activeFilter = sp.type ?? 'all';
  const listings = await getMarketplaceListings(activeFilter === 'all' ? undefined : activeFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Services Marketplace</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Book trusted, vetted pet care professionals near you
          </p>
        </div>
        <Link
          href="/marketplace/become-provider"
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Become a Provider
        </Link>
      </div>

      {/* Booking success banner */}
      {sp.booked === 'true' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">Booking confirmed!</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              Your payment was processed successfully. Check your email for confirmation.
            </p>
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORY_FILTERS.map(cat => (
          <Link
            key={cat}
            href={cat === 'all' ? '/marketplace' : `/marketplace?type=${cat}`}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat === 'all' ? 'All Services' : SERVICE_CONFIG[cat]?.label ?? cat}
          </Link>
        ))}
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
            <PawPrint className="w-7 h-7 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No services yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Be the first to offer pet care services in your area.
          </p>
          <Link
            href="/marketplace/become-provider"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            List a Service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listings.map(listing => {
            const provider = listing.service_providers as {
              id: string;
              business_name: string;
              rating: number;
              review_count: number;
              is_verified: boolean;
              address?: { city?: string };
            };
            const cfg = SERVICE_CONFIG[listing.service_type] ?? SERVICE_CONFIG.other;
            const Icon = cfg.icon;

            return (
              <Link
                key={listing.id}
                href={`/marketplace/${listing.id}`}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {listing.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{provider.business_name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          ${Number(listing.price).toFixed(0)}
                          <PriceTypeBadge priceType={listing.price_type} />
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      {provider.rating > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {Number(provider.rating).toFixed(1)}
                          <span className="text-gray-400 dark:text-gray-500">({provider.review_count})</span>
                        </span>
                      )}
                      {provider.address?.city && (
                        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {provider.address.city}
                        </span>
                      )}
                      {provider.is_verified && (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                          <Shield className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Provider upsell */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-200" />
              <span className="text-sm font-semibold text-blue-100">For Pet Care Professionals</span>
            </div>
            <h3 className="font-bold text-lg">Start earning on PetOS today</h3>
            <p className="text-blue-100 text-sm mt-1">Keep 90% of every booking · Instant bank payouts · Free to list</p>
          </div>
          <Link
            href="/marketplace/become-provider"
            className="bg-white text-blue-600 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors flex-shrink-0"
          >
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  );
}
