import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { PostCard } from '@/components/feed/post-card'
import { CreatePost } from '@/components/feed/create-post'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPosts } from '@/lib/actions/posts'
import { getVotes } from '@/lib/actions/votes'
import { Building2, Users, Vote, Package, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { User, Neighborhood } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  const currentUser = profile as User | null

  let neighborhood: Neighborhood | null = null
  if (currentUser?.neighborhood_id) {
    const { data } = await supabase
      .from('neighborhoods')
      .select('*')
      .eq('id', currentUser.neighborhood_id)
      .single()
    neighborhood = data as Neighborhood | null
  }

  const { data: posts = [] } = await getPosts(currentUser?.neighborhood_id ?? undefined)
  const { data: votes = [] } = await getVotes(currentUser?.neighborhood_id ?? undefined)

  const activeVotes = votes?.filter((v) => v.status === 'active') ?? []
  const recentPosts = posts?.slice(0, 10) ?? []

  if (!currentUser?.neighborhood_id) {
    return (
      <div>
        <PageHeader
          title="Welcome to NeighborDAO"
          description="Connect and coordinate with your neighborhood"
        />
        <div className="max-w-lg mx-auto mt-8">
          <Card className="border-2 border-dashed border-green-200">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-green-600" size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Join a neighborhood</h2>
              <p className="text-gray-600 text-sm mb-6">
                You&apos;re not part of a neighborhood yet. Join an existing one or create your own to get started.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link
                  href="/neighborhood"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <Building2 size={16} />
                  Find a neighborhood
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={neighborhood?.name ?? 'Dashboard'}
        description={neighborhood ? `${neighborhood.city}, ${neighborhood.state}` : undefined}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Members"
          value={neighborhood?.member_count ?? 0}
          icon={<Users size={18} className="text-green-600" />}
        />
        <StatCard
          label="Posts"
          value={posts?.length ?? 0}
          icon={<Building2 size={18} className="text-blue-600" />}
        />
        <StatCard
          label="Active Votes"
          value={activeVotes.length}
          icon={<Vote size={18} className="text-purple-600" />}
        />
        <StatCard
          label="Resources"
          value={0}
          icon={<Package size={18} className="text-orange-600" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-2 space-y-4">
          <CreatePost
            user={currentUser}
            neighborhoodId={currentUser.neighborhood_id}
          />

          {recentPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="text-gray-300 mx-auto mb-3" size={36} />
                <p className="text-gray-500 text-sm">No posts yet. Be the first to share something!</p>
              </CardContent>
            </Card>
          ) : (
            recentPosts.map((post) => (
              <PostCard key={post.id} post={post} currentUser={currentUser} />
            ))
          )}
        </div>

        {/* Sidebar panel */}
        <div className="space-y-4">
          {/* Active votes */}
          {activeVotes.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Active Votes</h3>
                  <Link href="/votes" className="text-xs text-green-600 hover:text-green-700">
                    View all
                  </Link>
                </div>
                <div className="space-y-2">
                  {activeVotes.slice(0, 3).map((vote) => (
                    <Link key={vote.id} href="/votes">
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                        <Vote size={14} className="text-purple-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate group-hover:text-green-700">
                            {vote.title}
                          </p>
                          <p className="text-xs text-gray-500">{vote.total_votes} votes</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Neighborhood info */}
          {neighborhood && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Neighborhood</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Name: </span>
                    <span className="font-medium">{neighborhood.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location: </span>
                    <span className="font-medium">{neighborhood.city}, {neighborhood.state}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Members: </span>
                    <span className="font-medium">{neighborhood.member_count}</span>
                  </div>
                  {currentUser.role !== 'member' && (
                    <Badge variant="default" className="mt-1">
                      {currentUser.role === 'admin' ? 'Admin' : 'Moderator'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
          <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
