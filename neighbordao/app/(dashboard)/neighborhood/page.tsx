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
  getNeighborhood,
  getNeighborhoodMembers,
  createNeighborhood,
  joinNeighborhood,
  searchNeighborhoods,
  updateUserRole,
} from '@/lib/actions/neighborhoods'
import { Building2, Users, Search, PlusCircle, MapPin, X } from 'lucide-react'
import type { User, Neighborhood } from '@/types/database'

const roleConfig = {
  admin: { label: 'Admin', variant: 'default' as const },
  moderator: { label: 'Moderator', variant: 'info' as const },
  member: { label: 'Member', variant: 'secondary' as const },
}

export default function NeighborhoodPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null)
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Neighborhood[]>([])
  const [searching, setSearching] = useState(false)
  const [joining, setJoining] = useState<string | null>(null)

  // Create form state
  const [formData, setFormData] = useState({
    name: '', city: '', state: '', description: '', address: '', zipCode: '',
  })
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

    if (profile?.neighborhood_id) {
      const { data: hood } = await getNeighborhood(profile.neighborhood_id)
      setNeighborhood(hood ?? null)

      const { data: memberList } = await getNeighborhoodMembers(profile.neighborhood_id)
      setMembers(memberList ?? [])
    }

    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearching(true)
    const { data } = await searchNeighborhoods(searchQuery.trim())
    setSearchResults(data ?? [])
    setSearching(false)
  }

  async function handleJoin(neighborhoodId: string) {
    setJoining(neighborhoodId)
    const { error } = await joinNeighborhood(neighborhoodId)
    setJoining(null)
    if (error) alert(error)
    else {
      setShowJoin(false)
      loadData()
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)

    const { error } = await createNeighborhood({
      name: formData.name,
      city: formData.city,
      state: formData.state,
      description: formData.description || undefined,
      address: formData.address || undefined,
      zipCode: formData.zipCode || undefined,
    })

    setCreating(false)
    if (error) {
      setCreateError(error)
    } else {
      setShowCreate(false)
      loadData()
    }
  }

  async function handleRoleChange(userId: string, role: 'admin' | 'moderator' | 'member') {
    const { error } = await updateUserRole(userId, role)
    if (error) alert(error)
    else loadData()
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Neighborhood" />
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  // No neighborhood — show join/create options
  if (!currentUser?.neighborhood_id) {
    return (
      <div>
        <PageHeader title="Neighborhood" description="Join or create a neighborhood community" />

        {/* Join or create choice */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card
            className="cursor-pointer hover:shadow-md hover:border-green-300 transition-all border-2 border-dashed"
            onClick={() => setShowJoin(true)}
          >
            <CardContent className="py-8 text-center">
              <Search className="text-green-600 mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-gray-900 mb-1">Join existing</h3>
              <p className="text-sm text-gray-500">Search and join a neighborhood</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md hover:border-green-300 transition-all border-2 border-dashed"
            onClick={() => setShowCreate(true)}
          >
            <CardContent className="py-8 text-center">
              <PlusCircle className="text-green-600 mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-gray-900 mb-1">Create new</h3>
              <p className="text-sm text-gray-500">Start your own neighborhood</p>
            </CardContent>
          </Card>
        </div>

        {/* Join modal */}
        {showJoin && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Find a neighborhood</h2>
                <button onClick={() => setShowJoin(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Search by name, city, or zip code..."
                  />
                  <Button onClick={handleSearch} disabled={searching} size="sm">
                    <Search size={16} />
                    {searching ? '...' : 'Search'}
                  </Button>
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((hood) => (
                      <div key={hood.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{hood.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={11} />
                            {hood.city}, {hood.state}
                            {hood.zip_code && ` ${hood.zip_code}`}
                          </p>
                          <p className="text-xs text-gray-400">{hood.member_count} members</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleJoin(hood.id)}
                          disabled={joining === hood.id}
                        >
                          {joining === hood.id ? 'Joining...' : 'Join'}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery && !searching ? (
                  <p className="text-sm text-gray-500 text-center py-4">No results found.</p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Create neighborhood</h2>
                <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {(['name', 'city', 'state'] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {field} *
                    </label>
                    <input
                      type="text"
                      value={formData[field]}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    {creating ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Has neighborhood
  return (
    <div>
      <PageHeader title="Neighborhood" description="Manage your community" />

      {/* Neighborhood info card */}
      {neighborhood && (
        <Card className="mb-6">
          <CardContent className="py-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="text-green-600" size={26} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{neighborhood.name}</h2>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={13} />
                  {neighborhood.city}, {neighborhood.state}
                  {neighborhood.zip_code && ` ${neighborhood.zip_code}`}
                </p>
                {neighborhood.description && (
                  <p className="text-sm text-gray-600 mt-2">{neighborhood.description}</p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Users size={14} />
                    {neighborhood.member_count} members
                  </span>
                  <Badge variant={roleConfig[currentUser.role]?.variant ?? 'secondary'}>
                    {roleConfig[currentUser.role]?.label ?? currentUser.role}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users size={18} className="text-green-600" />
            Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-2">
            {members.map((member) => {
              const roleConf = roleConfig[member.role] ?? roleConfig.member
              const isSelf = member.id === currentUser?.id
              const isAdmin = currentUser?.role === 'admin'

              return (
                <div key={member.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar src={member.avatar_url} name={member.full_name ?? member.email} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.full_name ?? 'Neighbor'}
                        {isSelf && <span className="text-xs text-gray-400 ml-1">(you)</span>}
                      </p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={roleConf.variant}>{roleConf.label}</Badge>
                    {isAdmin && !isSelf && (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as 'admin' | 'moderator' | 'member')}
                        className="text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        <option value="member">Member</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
