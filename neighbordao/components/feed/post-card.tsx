'use client'

import { useState } from 'react'
import { Heart, MessageSquare, Pin, Sparkles, Trash2, MoreVertical } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { likePost, deletePost } from '@/lib/actions/posts'
import { summarizePost } from '@/lib/actions/ai'
import { formatRelativeTime, POST_CATEGORY_COLORS, POST_CATEGORY_LABELS } from '@/lib/utils'
import type { Post, User } from '@/types/database'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: Post
  currentUser: User
  onRefresh?: () => void
}

export function PostCard({ post, currentUser, onRefresh }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [summary, setSummary] = useState<string | null>(post.ai_summary)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isAuthor = post.author_id === currentUser.id
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'moderator'
  const canDelete = isAuthor || isAdmin

  const categoryColor = POST_CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-700'
  const categoryLabel = POST_CATEGORY_LABELS[post.category] ?? post.category

  async function handleLike() {
    setLiked((prev) => !prev)
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1))
    await likePost(post.id)
  }

  async function handleSummarize() {
    setSummaryLoading(true)
    const { data, error } = await summarizePost(post.id)
    setSummaryLoading(false)
    if (data) setSummary(data)
  }

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setDeleting(true)
    const { error } = await deletePost(post.id)
    if (error) {
      setDeleting(false)
      alert(error)
    } else {
      onRefresh?.()
    }
  }

  return (
    <Card className={cn('transition-shadow hover:shadow-md', post.is_pinned && 'border-green-300 bg-green-50/30')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar
              src={post.author?.avatar_url}
              name={post.author?.full_name ?? post.author?.email}
              size="sm"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900">
                  {post.author?.full_name ?? 'Neighbor'}
                </span>
                <span className="text-xs text-gray-400">
                  {formatRelativeTime(post.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', categoryColor)}>
                  {categoryLabel}
                </span>
                {post.is_pinned && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                    <Pin size={11} /> Pinned
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions menu */}
          <div className="relative flex-shrink-0">
            {canDelete && (
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="More options"
              >
                <MoreVertical size={16} />
              </button>
            )}
            {showMenu && (
              <div
                className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[130px]"
                onMouseLeave={() => setShowMenu(false)}
              >
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    {deleting ? 'Deleting...' : 'Delete post'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <h3 className="text-base font-semibold text-gray-900 mb-1.5 leading-snug">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* AI Summary */}
        {summary && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={13} className="text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">AI Summary</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">{summary}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 gap-2 flex-wrap">
        <button
          onClick={handleLike}
          className={cn(
            'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors',
            liked
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          )}
        >
          <Heart size={14} className={liked ? 'fill-current' : ''} />
          <span>{likesCount}</span>
        </button>

        <button className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <MessageSquare size={14} />
          <span>{post.comments_count}</span>
        </button>

        {!summary && (
          <button
            onClick={handleSummarize}
            disabled={summaryLoading}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50 ml-auto"
          >
            <Sparkles size={14} />
            {summaryLoading ? 'Summarizing...' : 'AI Summary'}
          </button>
        )}
      </CardFooter>
    </Card>
  )
}
