import { ContentBlockCard } from './content-block-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Blocks } from 'lucide-react';
import type { ContentBlock } from '@/types/database';

interface ContentBlockListProps {
  blocks: ContentBlock[];
}

export function ContentBlockList({ blocks }: ContentBlockListProps) {
  if (blocks.length === 0) {
    return (
      <EmptyState
        icon={Blocks}
        title="No content blocks yet"
        description="Create reusable content blocks for your proposals."
      />
    );
  }

  return (
    <div className="space-y-3">
      {blocks.map((block) => (
        <ContentBlockCard key={block.id} block={block} />
      ))}
    </div>
  );
}
