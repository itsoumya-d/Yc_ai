import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { PostCard } from '@/components/feed/post-card'
import { CreatePost } from '@/components/feed/create-post'
import { Card, CardContent } from '@/components/ui/card'
import { getPosts } from '@/lib/actions/posts'
import { MessageSquare } from 'lucide-react'
import type { User, PostCategory } from '@/types/database'
import { POST_CATEGORY_LABELS } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const ALL_CATEGORIES: (PostCategory | 'all')[] = [
  'all',
  'announcement',
  'discussion',
  'event',
  'alert',
  'question',
]

interface PostsPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  const currentUser = profile as User | null
  if (!currentUser) redirect('/login')

  const params = await searchParams
  const activeCategory = (params.category ?? 'all') as PostCategory | 'all'

  const { data: posts = [], error } = await getPosts(currentUser.neighborhood_id ?? undefined)

  const filteredPosts = activeCategory === 'all'
    ? posts ?? []
    : (posts ?? []).filter((p) => p.category === activeCategory)

  if (!currentUser.neighborhood_id) {
    return (
      <div>
        <PageHeader title="Community Posts" description="Stay informed about your neighborhood" />
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="text-gray-300 mx-auto mb-3" size={36} />
            <p className="text-gray-500">Join a neighborhood to see posts.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Community Posts"
        description="Discussions, announcements, and events from your neighborhood"
      />

      {/* Create post */}
      <div className="mb-5">
        <CreatePost user={currentUser} neighborhoodId={currentUser.neighborhood_id} />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {ALL_CATEGORIES.map((cat) => (
          <a
            key={cat}
            href={cat === 'all' ? '/posts' : `/posts?category=${cat}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700'
            }`}
          >
            {cat === 'all' ? 'All Posts' : POST_CATEGORY_LABELS[cat]}
          </a>
        ))}
      </div>

      {/* Posts list */}
      {error && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-500 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {!error && filteredPosts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="text-gray-300 mx-auto mb-3" size={36} />
            <p className="text-gray-500 text-sm">
              {activeCategory === 'all'
                ? 'No posts yet. Create the first one!'
                : `No ${POST_CATEGORY_LABELS[activeCategory as PostCategory]} posts yet.`}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} currentUser={currentUser} />
        ))}
      </div>
    </div>
  )
}
