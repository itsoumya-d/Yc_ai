'use client'

import { useState } from 'react'
import { PlusCircle, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { createPost } from '@/lib/actions/posts'
import { POST_CATEGORY_LABELS } from '@/lib/utils'
import type { PostCategory, User } from '@/types/database'

interface CreatePostProps {
  user: User
  neighborhoodId: string
  onCreated?: () => void
}

const categories: PostCategory[] = ['announcement', 'discussion', 'event', 'alert', 'question']

export function CreatePost({ user, neighborhoodId, onCreated }: CreatePostProps) {
  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<PostCategory>('discussion')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setTitle('')
    setContent('')
    setCategory('discussion')
    setError(null)
    setExpanded(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    setError(null)

    const { error: submitError } = await createPost({
      title: title.trim(),
      content: content.trim(),
      category,
      neighborhoodId,
    })

    setLoading(false)

    if (submitError) {
      setError(submitError)
    } else {
      reset()
      onCreated?.()
    }
  }

  if (!expanded) {
    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setExpanded(true)}
      >
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={user.avatar_url}
              name={user.full_name ?? user.email}
              size="sm"
            />
            <div className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:border-green-300 transition-colors bg-gray-50">
              Share something with your neighborhood...
            </div>
            <PlusCircle size={20} className="text-green-600 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-300 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Create a post</CardTitle>
          <button
            onClick={reset}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Author row */}
          <div className="flex items-center gap-2">
            <Avatar
              src={user.avatar_url}
              name={user.full_name ?? user.email}
              size="sm"
            />
            <span className="text-sm font-medium text-gray-900">
              {user.full_name ?? 'Neighbor'}
            </span>
          </div>

          {/* Category selector */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PostCategory)}
              className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white pr-8"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {POST_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            required
            maxLength={200}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What would you like to share with your neighbors?"
            required
            rows={4}
            maxLength={5000}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400">{content.length}/5000</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={reset}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={loading || !title.trim() || !content.trim()}>
                {loading ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
