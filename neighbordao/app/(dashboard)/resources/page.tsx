import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getNeighborhood } from '@/lib/actions/neighborhood';
import { getResources } from '@/lib/actions/resources';
import { Resource } from '@/types/database';
import Link from 'next/link';

const categoryIcons: Record<string, string> = {
  tools: '🔧',
  equipment: '⚙️',
  space: '🏠',
  vehicle: '🚗',
  other: '📦',
};

function ResourceCard({ resource }: { resource: Resource }) {
  const icon = categoryIcons[resource.category] ?? '📦';

  return (
    <div className="bg-white rounded-xl border border-green-100 p-5 hover:border-green-200 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-green-900 truncate">{resource.name}</h3>
            <span
              className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                resource.is_available
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {resource.is_available ? 'Available' : 'In Use'}
            </span>
          </div>
          <p className="text-sm text-green-600 capitalize">{resource.category}</p>
          {resource.description && (
            <p className="text-sm text-green-700 mt-1 line-clamp-2">{resource.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-green-500">
              Owner: {resource.owner_name}
              {resource.deposit_amount > 0 && (
                <span className="ml-2 text-amber-600 font-medium">
                  ${resource.deposit_amount.toFixed(2)} deposit
                </span>
              )}
            </div>
            {resource.is_available && (
              <Link
                href={`/resources/${resource.id}/book`}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Book
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const neighborhood = await getNeighborhood();
  if (!neighborhood) redirect('/onboarding');

  const resources = await getResources(neighborhood.id);
  const available = resources.filter((r) => r.is_available);
  const inUse = resources.filter((r) => !r.is_available);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Shared Resources</h1>
          <p className="text-green-600 text-sm mt-1">Borrow tools and equipment from neighbors</p>
        </div>
        <Link
          href="/resources/new"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + List Resource
        </Link>
      </div>

      {resources.length === 0 ? (
        <div className="bg-white rounded-xl border border-green-100 p-8 text-center">
          <p className="text-green-600">No resources listed yet. Share something with your neighbors!</p>
        </div>
      ) : (
        <>
          {available.length > 0 && (
            <section className="mb-8">
              <h2 className="text-base font-semibold text-green-800 mb-3">
                Available ({available.length})
              </h2>
              <div className="grid gap-3">
                {available.map((r) => <ResourceCard key={r.id} resource={r} />)}
              </div>
            </section>
          )}

          {inUse.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-green-800 mb-3">
                Currently In Use ({inUse.length})
              </h2>
              <div className="grid gap-3">
                {inUse.map((r) => <ResourceCard key={r.id} resource={r} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
