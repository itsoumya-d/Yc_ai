import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getNeighborhood } from '@/lib/actions/neighborhood';
import { getPosts } from '@/lib/actions/posts';
import { getGroupOrders } from '@/lib/actions/group-orders';
import { getResources } from '@/lib/actions/resources';
import { getVotes } from '@/lib/actions/votes';
import { Post } from '@/types/database';
import Link from 'next/link';

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const categoryStyles: Record<string, { label: string; className: string }> = {
  general: { label: 'General', className: 'bg-gray-100 text-gray-700' },
  event: { label: 'Event', className: 'bg-blue-100 text-blue-700' },
  alert: { label: 'Alert', className: 'bg-red-100 text-red-700' },
  marketplace: { label: 'Marketplace', className: 'bg-amber-100 text-amber-700' },
  request: { label: 'Request', className: 'bg-purple-100 text-purple-700' },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const neighborhood = await getNeighborhood();
  if (!neighborhood) redirect('/onboarding');

  const [posts, orders, resources, votes] = await Promise.all([
    getPosts(neighborhood.id),
    getGroupOrders(neighborhood.id),
    getResources(neighborhood.id),
    getVotes(neighborhood.id),
  ]);

  const activeOrders = orders.filter((o) => o.status === 'open' || o.status === 'minimum_met').length;
  const availableResources = resources.filter((r) => r.is_available).length;
  const openVotes = votes.filter((v) => !v.is_closed && new Date(v.deadline) > new Date()).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-900">{neighborhood.name}</h1>
        <p className="text-green-600 text-sm mt-1">{neighborhood.description}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link href="/group-purchases" className="bg-white rounded-xl border border-green-100 p-4 hover:border-green-300 transition-colors">
          <p className="text-2xl font-bold text-green-700">{activeOrders}</p>
          <p className="text-sm text-green-600">Active Group Orders</p>
        </Link>
        <Link href="/resources" className="bg-white rounded-xl border border-green-100 p-4 hover:border-green-300 transition-colors">
          <p className="text-2xl font-bold text-green-700">{availableResources}</p>
          <p className="text-sm text-green-600">Available Resources</p>
        </Link>
        <Link href="/voting" className="bg-white rounded-xl border border-green-100 p-4 hover:border-green-300 transition-colors">
          <p className="text-2xl font-bold text-green-700">{openVotes}</p>
          <p className="text-sm text-green-600">Open Votes</p>
        </Link>
      </div>

      {/* Community Feed */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-green-900">Community Feed</h2>
        <Link
          href="/dashboard/new-post"
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-green-100 p-8 text-center">
          <p className="text-green-600">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post: Post) => {
            const cat = categoryStyles[post.category] ?? categoryStyles.general;
            return (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-green-100 p-5 hover:border-green-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.className}`}>
                        {cat.label}
                      </span>
                      {post.is_pinned && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Pinned
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-green-900 truncate">{post.title}</h3>
                    {post.ai_summary ? (
                      <p className="text-sm text-green-700 mt-1 line-clamp-2">{post.ai_summary}</p>
                    ) : (
                      <p className="text-sm text-green-600 mt-1 line-clamp-2">{post.body}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-green-500">
                  <span>{post.author_name}</span>
                  <span>&bull;</span>
                  <span>{timeAgo(post.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
