'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import {
  getResources,
  createResource,
  borrowResource,
  returnResource,
} from '@/lib/actions/resources'
import { Package, PlusCircle, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import type { Resource, User } from '@/types/database'
import { formatRelativeTime } from '@/lib/utils'

const RESOURCE_CATEGORIES = [
  'Tools',
  'Sports & Recreation',
  'Garden & Outdoor',
  'Kitchen & Cooking',
  'Electronics',
  'Books & Media',
  'Other',
]

const statusConfig = {
  available: { label: 'Available', variant: 'success' as const },
  borrowed: { label: 'Borrowed', variant: 'warning' as const },
  maintenance: { label: 'Maintenance', variant: 'secondary' as const },
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Create form
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(RESOURCE_CATEGORIES[0])
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const router = useRouter()

  async function loadData() {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    setCurrentUser(profile as User)

    const { data: resourcesData } = await getResources(profile?.neighborhood_id ?? undefined)
    setResources(resourcesData ?? [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser?.neighborhood_id) return

    setCreating(true)
    setCreateError(null)

    const { error } = await createResource({
      name,
      description: description || undefined,
      category,
      neighborhoodId: currentUser.neighborhood_id,
    })

    setCreating(false)
    if (error) {
      setCreateError(error)
    } else {
      setShowCreate(false)
      setName('')
      setDescription('')
      setCategory(RESOURCE_CATEGORIES[0])
      loadData()
    }
  }

  async function handleBorrow(id: string) {
    setActionLoading(id)
    const { error } = await borrowResource(id)
    setActionLoading(null)
    if (error) alert(error)
    else loadData()
  }

  async function handleReturn(id: string) {
    setActionLoading(id)
    const { error } = await returnResource(id)
    setActionLoading(null)
    if (error) alert(error)
    else loadData()
  }

  const allCategories = ['all', ...RESOURCE_CATEGORIES]
  const filtered = filterCategory === 'all'
    ? resources
    : resources.filter((r) => r.category === filterCategory)

  if (loading) {
    return (
      <div>
        <PageHeader title="Resources" description="Share tools and items with your neighbors" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-8">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Shared Resources"
        description="Borrow and lend items within your neighborhood"
        actions={
          currentUser?.neighborhood_id && (
            <Button onClick={() => setShowCreate(true)} size="sm">
              <PlusCircle size={16} />
              Add resource
            </Button>
          )
        }
      />

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Add a resource</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Electric Drill, Lawn Mower"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {RESOURCE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Describe the item, condition, any usage notes..."
                />
              </div>

              {createError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {createError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={creating}>
                  {creating ? 'Adding...' : 'Add resource'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!currentUser?.neighborhood_id ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="text-gray-300 mx-auto mb-3" size={36} />
            <p className="text-gray-500">Join a neighborhood to share and borrow resources.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filterCategory === cat
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="text-gray-300 mx-auto mb-3" size={36} />
                <p className="text-gray-500 text-sm">
                  No resources yet. Be the first to add something!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((resource) => {
                const conf = statusConfig[resource.status] ?? statusConfig.available
                const isOwner = resource.owner_id === currentUser?.id
                const isBorrower = resource.borrower_id === currentUser?.id

                return (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-green-600" />
                        </div>
                        <Badge variant={conf.variant}>{conf.label}</Badge>
                      </div>
                      <CardTitle className="text-base mt-2">{resource.name}</CardTitle>
                    </CardHeader>

                    <CardContent className="pb-4">
                      <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mb-2">
                        {resource.category}
                      </span>
                      {resource.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                      )}

                      <div className="flex items-center gap-2 mb-4">
                        <Avatar
                          src={resource.owner?.avatar_url}
                          name={resource.owner?.full_name ?? resource.owner?.email}
                          size="xs"
                        />
                        <span className="text-xs text-gray-500">
                          {isOwner ? 'You' : (resource.owner?.full_name ?? 'Neighbor')} &bull; {formatRelativeTime(resource.created_at)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {!isOwner && resource.status === 'available' && (
                          <Button
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleBorrow(resource.id)}
                            disabled={actionLoading === resource.id}
                          >
                            <ArrowDownLeft size={14} />
                            {actionLoading === resource.id ? '...' : 'Borrow'}
                          </Button>
                        )}
                        {isBorrower && resource.status === 'borrowed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={() => handleReturn(resource.id)}
                            disabled={actionLoading === resource.id}
                          >
                            <ArrowUpRight size={14} />
                            {actionLoading === resource.id ? '...' : 'Return'}
                          </Button>
                        )}
                        {isOwner && (
                          <span className="text-xs text-gray-400 self-center">Your item</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
