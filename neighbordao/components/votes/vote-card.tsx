'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, Users, Vote as VoteIcon } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { castVote, closeVote } from '@/lib/actions/votes'
import { formatRelativeTime, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Vote, VoteOption, User } from '@/types/database'

interface VoteCardProps {
  vote: Vote
  currentUser: User
  userVotedOptionId?: string | null
  onRefresh?: () => void
}

const statusConfig = {
  active: { label: 'Active', variant: 'success' as const },
  passed: { label: 'Passed', variant: 'info' as const },
  failed: { label: 'Failed', variant: 'destructive' as const },
  cancelled: { label: 'Cancelled', variant: 'secondary' as const },
}

export function VoteCard({ vote, currentUser, userVotedOptionId, onRefresh }: VoteCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [votedOptionId, setVotedOptionId] = useState<string | null>(userVotedOptionId ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localOptions, setLocalOptions] = useState<VoteOption[]>(vote.options ?? [])
  const [totalVotes, setTotalVotes] = useState(vote.total_votes)

  const hasVoted = votedOptionId !== null
  const isActive = vote.status === 'active'
  const isCreator = vote.created_by === currentUser.id
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'moderator'
  const canClose = isActive && (isCreator || isAdmin)

  const statusConf = statusConfig[vote.status] ?? statusConfig.active

  async function handleVote() {
    if (!selectedOption || hasVoted || !isActive) return

    setSubmitting(true)
    setError(null)

    const { error: voteError } = await castVote(vote.id, selectedOption)

    if (voteError) {
      setError(voteError)
      setSubmitting(false)
      return
    }

    // Update local state optimistically
    setVotedOptionId(selectedOption)
    setLocalOptions((prev) =>
      prev.map((opt) =>
        opt.id === selectedOption
          ? { ...opt, votes_count: opt.votes_count + 1 }
          : opt
      )
    )
    setTotalVotes((prev) => prev + 1)
    setSubmitting(false)
    onRefresh?.()
  }

  async function handleClose() {
    if (!confirm('Close this vote? This cannot be undone.')) return
    const { error } = await closeVote(vote.id)
    if (error) setError(error)
    else onRefresh?.()
  }

  const maxVotes = Math.max(...localOptions.map((o) => o.votes_count), 1)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant={statusConf.variant}>{statusConf.label}</Badge>
              {vote.ends_at && isActive && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  Ends {formatDate(vote.ends_at)}
                </span>
              )}
            </div>
            <CardTitle className="text-base leading-snug">{vote.title}</CardTitle>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Avatar
            src={vote.creator?.avatar_url}
            name={vote.creator?.full_name ?? vote.creator?.email}
            size="xs"
          />
          <span className="text-xs text-gray-500">
            Posted by {vote.creator?.full_name ?? 'Neighbor'} &bull; {formatRelativeTime(vote.created_at)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {vote.description && (
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{vote.description}</p>
        )}

        <div className="space-y-2.5">
          {localOptions.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.votes_count / totalVotes) * 100) : 0
            const isWinner = !isActive && option.votes_count === maxVotes && totalVotes > 0
            const isUserChoice = votedOptionId === option.id

            return (
              <div key={option.id}>
                {/* Option button (when can vote) */}
                {isActive && !hasVoted ? (
                  <button
                    onClick={() => setSelectedOption(option.id)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all',
                      selectedOption === option.id
                        ? 'border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors',
                          selectedOption === option.id
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        )}
                      >
                        {selectedOption === option.id && (
                          <div className="w-full h-full rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      {option.text}
                    </div>
                  </button>
                ) : (
                  /* Results view */
                  <div
                    className={cn(
                      'px-3 py-2.5 rounded-lg border',
                      isUserChoice ? 'border-green-300 bg-green-50/50' : 'border-gray-100',
                      isWinner && 'border-emerald-400 bg-emerald-50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 text-sm">
                        {isUserChoice && (
                          <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
                        )}
                        <span className={cn('font-medium', isWinner ? 'text-emerald-800' : 'text-gray-800')}>
                          {option.text}
                        </span>
                        {isWinner && <span className="text-xs text-emerald-600 font-semibold ml-1">Winner</span>}
                      </div>
                      <span className="text-xs font-semibold text-gray-600">
                        {percentage}% ({option.votes_count})
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          isWinner ? 'bg-emerald-500' : 'bg-green-400'
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {error && (
          <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0 gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users size={13} />
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </div>

        {isActive && !hasVoted && (
          <Button
            size="sm"
            onClick={handleVote}
            disabled={!selectedOption || submitting}
            className="ml-auto"
          >
            <VoteIcon size={14} />
            {submitting ? 'Submitting...' : 'Submit vote'}
          </Button>
        )}

        {hasVoted && isActive && (
          <span className="ml-auto text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle2 size={14} />
            Vote recorded
          </span>
        )}

        {canClose && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleClose}
            className="ml-auto text-xs"
          >
            Close vote
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
