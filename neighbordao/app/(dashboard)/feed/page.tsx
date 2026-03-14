import { getFeedPosts } from '@/lib/actions/posts';
import { formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

const CATEGORIES = ['all', 'general', 'alert', 'safety', 'marketplace', 'question', 'recommendation'];
const CATEGORY_COLORS: Record<string, string> = {
  general: 'bg-slate-100 text-slate-700',
  alert: 'bg-red-100 text-red-700',
  safety: 'bg-orange-100 text-orange-700',
  marketplace: 'bg-green-100 text-green-700',
  question: 'bg-blue-100 text-blue-700',
  recommendation: 'bg-purple-100 text-purple-700',
};

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const { data: posts } = await getFeedPosts(category);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Neighborhood Feed</h1>
        <Link href="/feed/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          + New Post
        </Link>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {CATEGORIES.map(cat => (
          <Link key={cat} href={cat === 'all' ? '/feed' : `/feed?category=${cat}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              (category === cat || (!category && cat === 'all'))
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">📋</p>
          <h3 className="font-semibold text-slate-900 mb-1">No posts yet</h3>
          <p className="text-slate-600 text-sm">Be the first to post in your neighborhood!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                  {(post.user_profile as { full_name?: string } | null)?.full_name?.[0] ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{(post.user_profile as { full_name?: string } | null)?.full_name ?? 'Neighbor'}</p>
                  <p className="text-xs text-slate-500">{formatRelativeTime(post.created_at)}</p>
                </div>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[post.category] ?? 'bg-slate-100 text-slate-700'}`}>
                  {post.category}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{post.title}</h3>
              <p className="text-sm text-slate-600 line-clamp-3">{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
