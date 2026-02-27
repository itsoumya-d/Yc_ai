'use client';

import { useState } from 'react';
import { Sparkles, Plus, ThumbsUp, MessageCircle, Share2, Pin, MoreHorizontal, AlertTriangle, HelpCircle, Star, ShoppingBag, MapPin } from 'lucide-react';
import { cn, formatRelativeTime, getCategoryColor, truncate } from '@/lib/utils';
import type { PostCategory } from '@/types/database';

const CATEGORY_LABELS: Record<PostCategory, string> = {
  general: 'General', event: 'Event', alert: 'Alert', question: 'Question',
  recommendation: 'Recommendation', marketplace: 'Marketplace', lost_found: 'Lost & Found', safety: 'Safety',
};

const CATEGORY_ICONS: Partial<Record<PostCategory, React.ElementType>> = {
  alert: AlertTriangle, safety: AlertTriangle, question: HelpCircle,
  recommendation: Star, marketplace: ShoppingBag, event: MapPin,
};

interface Post {
  id: string; author: string; initials: string; category: PostCategory;
  content: string; commentCount: number; reactions: number;
  time: string; isPinned?: boolean; aiSummary?: string;
}

const DEMO_POSTS: Post[] = [
  {
    id: '1', author: 'Sarah M.', initials: 'SM', category: 'alert',
    content: 'Water main repair on Elm St tomorrow 8am–2pm. Expect low pressure. Contractor: ABC Plumbing. Park on Oak Ave if possible.',
    commentCount: 12, reactions: 34, time: new Date(Date.now() - 2 * 3600_000).toISOString(), isPinned: true,
  },
  {
    id: '2', author: 'Mike T.', initials: 'MT', category: 'question',
    content: 'Anyone know a good arborist? The oak tree in my front yard has a suspicious crack near the base. A little worried about it falling.',
    commentCount: 23, reactions: 8, time: new Date(Date.now() - 5 * 3600_000).toISOString(),
    aiSummary: '5 neighbors recommended Johnson Tree Care. 2 suggested getting multiple quotes. Consensus: call Johnson first, budget $300–500.',
  },
  {
    id: '3', author: 'Lisa R.', initials: 'LR', category: 'event',
    content: 'Block Party Planning Meeting this Saturday at 4PM in the community center! We need volunteers for food coordination and games setup. RSVP below.',
    commentCount: 7, reactions: 15, time: new Date(Date.now() - 8 * 3600_000).toISOString(),
  },
  {
    id: '4', author: 'David K.', initials: 'DK', category: 'recommendation',
    content: 'Shoutout to Tony\'s Pizza on Main — they gave our neighborhood a 10% discount on all orders over $50. Just mention "Oak Hills".',
    commentCount: 19, reactions: 47, time: new Date(Date.now() - 24 * 3600_000).toISOString(),
  },
  {
    id: '5', author: 'Ann P.', initials: 'AP', category: 'marketplace',
    content: 'Selling my son\'s old mountain bike — Trek Marlin 5, 2022, barely used. Asking $380 OBO. Great condition, just upgraded to a newer model.',
    commentCount: 3, reactions: 2, time: new Date(Date.now() - 36 * 3600_000).toISOString(),
  },
];

const FILTERS: Array<{ key: PostCategory | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'alert', label: 'Alerts' },
  { key: 'event', label: 'Events' },
  { key: 'question', label: 'Questions' },
  { key: 'recommendation', label: 'Recommendations' },
  { key: 'marketplace', label: 'Marketplace' },
];

function PostCard({ post }: { post: Post }) {
  const [expanded, setExpanded] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const CategoryIcon = CATEGORY_ICONS[post.category];
  const catColor = getCategoryColor(post.category);

  return (
    <article
      className={cn(
        'rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
        post.isPinned && 'border-l-4 border-l-[#CA8A04]',
      )}
      style={{ borderColor: 'var(--border)' }}
    >
      {post.isPinned && (
        <div className="mb-3 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#A16207' }}>
          <Pin className="h-3.5 w-3.5" /> Pinned post
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-sm font-bold text-white">
            {post.initials}
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{post.author}</div>
            <time className="text-xs" style={{ color: 'var(--text-tertiary)' }} dateTime={post.time}>
              {formatRelativeTime(post.time)}
            </time>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-xs font-medium text-white"
            style={{ background: catColor }}
          >
            {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
            {CATEGORY_LABELS[post.category]}
          </span>
          <button className="rounded-md p-1" aria-label="More options" style={{ color: 'var(--text-tertiary)' }}>
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        {expanded ? post.content : truncate(post.content, 160)}
        {post.content.length > 160 && (
          <button onClick={() => setExpanded(!expanded)} className="ml-1 font-medium text-[#16A34A] hover:underline text-sm">
            {expanded ? 'less' : 'more'}
          </button>
        )}
      </p>

      {/* AI Summary */}
      {post.aiSummary && (
        <div className="mt-3">
          <button
            onClick={() => setAiOpen(!aiOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-1.5 text-xs font-medium text-[#15803D]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Summary{aiOpen ? ' ▲' : ' ▼'}
          </button>
          {aiOpen && (
            <div className="mt-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-3 text-sm leading-relaxed" style={{ color: '#15803D' }}>
              {post.aiSummary}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-4 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
        <button className="flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-[#F0FDF4] hover:text-[#16A34A]" style={{ color: 'var(--text-secondary)' }}>
          <ThumbsUp className="h-4 w-4" /> {post.reactions}
        </button>
        <button className="flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-[#F0FDF4] hover:text-[#16A34A]" style={{ color: 'var(--text-secondary)' }}>
          <MessageCircle className="h-4 w-4" /> {post.commentCount}
        </button>
        <button className="flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-[#F0FDF4] hover:text-[#16A34A]" style={{ color: 'var(--text-secondary)' }}>
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>
    </article>
  );
}

export default function FeedPage() {
  const [filter, setFilter] = useState<PostCategory | 'all'>('all');
  const [composerOpen, setComposerOpen] = useState(false);
  const [newPost, setNewPost] = useState('');

  const filtered = filter === 'all' ? DEMO_POSTS : DEMO_POSTS.filter(p => p.category === filter);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
          Oak Hills Feed
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>What&apos;s happening in your neighborhood</p>
      </div>

      {/* Compose */}
      <div className="mb-5 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: 'var(--border)' }}>
        {composerOpen ? (
          <div>
            <textarea
              value={newPost} onChange={e => setNewPost(e.target.value)}
              rows={3} placeholder="What's happening in Oak Hills?"
              className="w-full resize-none rounded-lg border px-3 py-2 text-base outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              autoFocus
            />
            <div className="mt-2 flex justify-end gap-2">
              <button onClick={() => setComposerOpen(false)} className="rounded-lg px-3 py-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Cancel
              </button>
              <button className="rounded-lg bg-[#16A34A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#15803D]">
                Post
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setComposerOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-base transition-all hover:bg-[#F5F5F4]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}
          >
            <Plus className="h-4 w-4 text-[#16A34A]" />
            What&apos;s happening in Oak Hills?
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label="Filter posts">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            role="radio" aria-checked={filter === f.key}
            className={cn(
              'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
              filter === f.key
                ? 'bg-[#16A34A] text-white shadow-sm'
                : 'border bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]',
            )}
            style={filter !== f.key ? { borderColor: 'var(--border)' } : undefined}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filtered.map(post => <PostCard key={post.id} post={post} />)}
        {filtered.length === 0 && (
          <div className="rounded-2xl border bg-white py-16 text-center" style={{ borderColor: 'var(--border)' }}>
            <p className="text-base" style={{ color: 'var(--text-tertiary)' }}>No posts in this category yet.</p>
            <button onClick={() => setComposerOpen(true)} className="mt-3 text-sm font-medium text-[#16A34A] hover:underline">
              Be the first to post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
