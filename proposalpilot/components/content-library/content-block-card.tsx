'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { deleteContentBlock } from '@/lib/actions/content-blocks';
import { getBlockTypeLabel } from '@/lib/utils';
import { Copy, Trash2 } from 'lucide-react';
import type { ContentBlock, ContentBlockType } from '@/types/database';

interface ContentBlockCardProps {
  block: ContentBlock;
}

export function ContentBlockCard({ block }: ContentBlockCardProps) {
  const { toast } = useToast();

  async function handleCopy() {
    await navigator.clipboard.writeText(block.content);
    toast({ title: 'Copied to clipboard' });
  }

  async function handleDelete() {
    if (!confirm('Delete this content block?')) return;
    const result = await deleteContentBlock(block.id);
    if (result.error) toast({ title: result.error, variant: 'destructive' });
    else toast({ title: 'Block deleted' });
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-[var(--foreground)] truncate">{block.title}</h3>
            <Badge variant={block.block_type as ContentBlockType}>{getBlockTypeLabel(block.block_type)}</Badge>
          </div>
          <p className="mt-2 text-sm text-[var(--muted-foreground)] line-clamp-3">{block.content}</p>
        </div>
        <div className="flex gap-1 ml-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={handleCopy}><Copy className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}><Trash2 className="w-4 h-4 text-[var(--destructive)]" /></Button>
        </div>
      </div>
    </Card>
  );
}
