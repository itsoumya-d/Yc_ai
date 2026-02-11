'use client';

import { useState } from 'react';
import { WorldElementCard } from './world-element-card';
import { WorldElementForm } from './world-element-form';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Globe } from 'lucide-react';
import type { WorldElement } from '@/types/database';

interface WorldElementListProps {
  elements: WorldElement[];
  storyId: string;
}

export function WorldElementList({ elements, storyId }: WorldElementListProps) {
  const [open, setOpen] = useState(false);

  if (elements.length === 0) {
    return (
      <div>
        <EmptyState
          icon={<Globe className="h-12 w-12" />}
          title="No world elements yet"
          description="Build your story's world with locations, lore, factions, and more."
          action={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-1.5 h-4 w-4" /> Add Element</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New World Element</DialogTitle>
                </DialogHeader>
                <WorldElementForm storyId={storyId} onSuccess={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Element</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New World Element</DialogTitle>
            </DialogHeader>
            <WorldElementForm storyId={storyId} onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {elements.map((element) => (
          <WorldElementCard key={element.id} element={element} />
        ))}
      </div>
    </div>
  );
}
