import { Heart, Plus } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchWishes } from '@/lib/actions/wishes';
import { getWishCategoryLabel } from '@/lib/utils';

export default async function WishesPage() {
  const result = await fetchWishes();
  const wishes = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Wishes</h1>
          <p className="text-sm text-text-secondary mt-1">Document your funeral, medical, and personal wishes</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-sage-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sage-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Wish
        </button>
      </div>

      {wishes.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-text-primary mb-1">No wishes yet</h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Start by documenting your preferences for funeral arrangements, medical directives, organ donation, and personal messages.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {wishes.map((wish) => (
            <Card key={wish.id} hover padding="lg">
              <div className="flex items-start justify-between mb-2">
                <Badge variant={wish.is_finalized ? 'green' : 'amber'}>
                  {wish.is_finalized ? 'Finalized' : 'Draft'}
                </Badge>
                <span className="text-xs text-text-muted">{getWishCategoryLabel(wish.category)}</span>
              </div>
              <h3 className="font-heading font-semibold text-text-primary mb-1">{wish.title}</h3>
              <p className="text-sm text-text-secondary line-clamp-2">{wish.content}</p>
              {wish.is_ai_generated && (
                <p className="text-xs text-trustblue-600 mt-2">AI-assisted</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
