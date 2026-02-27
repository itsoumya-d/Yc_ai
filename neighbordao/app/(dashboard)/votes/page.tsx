'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { VoteCard } from '@/components/votes/vote-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getVotes, createVote, getUserVote } from '@/lib/actions/votes'
import { PlusCircle, Vote as VoteIcon, X, Plus } from 'lucide-react'
import type { Vote, User } from '@/types/database'

export default function VotesPage() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userVotes, setUserVotes] = useState<Record<string, string | null>>({})
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active')

  // Create form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [endsAt, setEndsAt] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const router = useRouter()

  async function loadData() {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    setCurrentUser(profile as User)

    const { data: votesData } = await getVotes(profile?.neighborhood_id ?? undefined)
    setVotes(votesData ?? [])

    // Load user's votes
    if (votesData) {
      const userVoteMap: Record<string, string | null> = {}
      await Promise.all(
        votesData.map(async (vote) => {
          const { data } = await getUserVote(vote.id)
          userVoteMap[vote.id] = data ?? null
        })
      )
      setUserVotes(userVoteMap)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleCreateVote(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser?.neighborhood_id) return

    setCreating(true)
    setCreateError(null)

    const validOptions = options.filter((o) => o.trim() !== '')
    if (validOptions.length < 2) {
      setCreateError('Please add at least 2 options')
      setCreating(false)
      return
    }

    const { error } = await createVote({
      title,
      description,
      neighborhoodId: currentUser.neighborhood_id,
      options: validOptions,
      endsAt: endsAt || undefined,
    })

    setCreating(false)

    if (error) {
      setCreateError(error)
    } else {
      setShowCreate(false)
      setTitle('')
      setDescription('')
      setOptions(['', ''])
      setEndsAt('')
      loadData()
    }
  }

  function addOption() {
    setOptions((prev) => [...prev, ''])
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)))
  }

  const activeVotes = votes.filter((v) => v.status === 'active')
  const closedVotes = votes.filter((v) => v.status !== 'active')
  const displayedVotes = activeTab === 'active' ? activeVotes : closedVotes

  if (loading) {
    return (
      <div>
        <PageHeader title="Voting" description="Democratic decision-making for your neighborhood" />
        <div className="space-y-4">
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
        title="Voting"
        description="Democratic decision-making for your neighborhood"
        actions={
          currentUser?.neighborhood_id && (
            <Button onClick={() => setShowCreate(true)} size="sm">
              <PlusCircle size={16} />
              New vote
            </Button>
          )
        }
      />

      {/* Create vote modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Create a vote</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVote} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="What are we voting on?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Provide context for this vote..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={`Option ${idx + 1}`}
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700"
                >
                  <Plus size={14} />
                  Add option
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End date (optional)
                </label>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {createError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {createError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={creating}>
                  {creating ? 'Creating...' : 'Create vote'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!currentUser?.neighborhood_id ? (
        <Card>
          <CardContent className="py-12 text-center">
            <VoteIcon className="text-gray-300 mx-auto mb-3" size={36} />
            <p className="text-gray-500">Join a neighborhood to participate in voting.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
            {(['active', 'closed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab} ({tab === 'active' ? activeVotes.length : closedVotes.length})
              </button>
            ))}
          </div>

          {displayedVotes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <VoteIcon className="text-gray-300 mx-auto mb-3" size={36} />
                <p className="text-gray-500 text-sm">
                  {activeTab === 'active'
                    ? 'No active votes. Create one to start a community decision!'
                    : 'No closed votes yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayedVotes.map((vote) => (
                <VoteCard
                  key={vote.id}
                  vote={vote}
                  currentUser={currentUser}
                  userVotedOptionId={userVotes[vote.id]}
                  onRefresh={loadData}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
