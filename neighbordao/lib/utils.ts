import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('undefined', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}

export function truncate(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

export const POST_CATEGORY_LABELS: Record<string, string> = {
  announcement: 'Announcement',
  discussion: 'Discussion',
  event: 'Event',
  alert: 'Alert',
  question: 'Question',
}

export const POST_CATEGORY_COLORS: Record<string, string> = {
  announcement: 'bg-blue-100 text-blue-800',
  discussion: 'bg-green-100 text-green-800',
  event: 'bg-purple-100 text-purple-800',
  alert: 'bg-red-100 text-red-800',
  question: 'bg-yellow-100 text-yellow-800',
}