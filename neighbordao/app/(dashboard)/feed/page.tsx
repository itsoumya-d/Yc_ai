import { MessageSquare, Pin, ThumbsUp, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCategoryIcon, getStatusColor } from '@/lib/utils';
import type { PostCategory } from '@/types/database';

const categories: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'event', label: 'Events' },
  { value: 'alert', label: 'Alerts' },
  { value: 'question', label: 'Questions' },
  { value: 'recommendation', label: 'Recommendations' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'safety', label: 'Safety' },
  { value: 'lost_found', label: 'Lost & Found' },
];

const categoryColors: Record<string, string> = {
  general: 'default',
  event: 'sky',
  alert: 'red',
  question: 'earth',
  recommendation: 'green',
  lost_found: 'amber',
  marketplace: 'blue',
  safety: 'red',
};

export default function FeedPage() {
  // In production, this would fetch from server actions
  // For now, showing the UI structure with empty state

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Community Feed
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Stay connected with your neighborhood
        </p>
      </div>

      {/* Post Composer */}
      <Card className="mb-6" padding="md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf-100 text-leaf-700 font-heading font-bold text-sm">
            ?
          </div>
          <div className="flex-1">
            <div className="rounded-[var(--radius-pill)] border border-border bg-surface-hover px-4 py-2.5 text-sm text-text-muted cursor-pointer hover:bg-surface-active transition-colors">
              What&apos;s happening in your neighborhood?
            </div>
          </div>
        </div>
      </Card>

      {/* Category Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className="rounded-[var(--radius-pill)] border border-border bg-surface px-4 py-1.5 text-xs font-medium text-text-secondary hover:bg-leaf-50 hover:text-leaf-700 hover:border-leaf-200 transition-colors whitespace-nowrap first:bg-leaf-50 first:text-leaf-700 first:border-leaf-200"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <Card padding="lg" className="text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-text-muted mb-4" />
        <h3 className="font-heading text-lg font-bold text-text-primary">
          Your neighborhood is quiet
        </h3>
        <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
          Be the first to post! Share an update, ask a question, or let neighbors know about
          something happening in the community.
        </p>
        <Button className="mt-4">Create First Post</Button>
      </Card>
    </div>
  );
}
