'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { updateProposalSectionOrder } from '@/lib/actions/proposal-sections';
import { Layers, GripVertical } from 'lucide-react';
import type { ProposalSection } from '@/types/database';

interface SortableSectionItemProps {
  section: ProposalSection;
  index: number;
  proposalId: string;
}

function SortableSectionItem({ section, index, proposalId }: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow ${isDragging ? 'shadow-lg' : ''}`}>
        <div className="flex items-center gap-3">
          <button
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none p-0.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors flex-shrink-0"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <Link href={`/proposals/${proposalId}/sections/${section.id}`} className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-sm font-medium text-[var(--muted-foreground)]">{index + 1}.</span>
            <h3 className="font-medium text-[var(--foreground)] truncate">{section.title}</h3>
            <span className="ml-auto text-xs text-[var(--muted-foreground)] capitalize flex-shrink-0">
              {section.section_type.replace('_', ' ')}
            </span>
          </Link>
        </div>
        {section.content && (
          <p className="mt-2 ml-10 text-sm text-[var(--muted-foreground)] line-clamp-2">{section.content}</p>
        )}
      </Card>
    </div>
  );
}

interface ProposalSectionListProps {
  sections: ProposalSection[];
  proposalId: string;
}

export function ProposalSectionList({ sections: initialSections, proposalId }: ProposalSectionListProps) {
  const { toast } = useToast();
  const [sections, setSections] = useState(initialSections);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);

    setSections(reordered);

    const result = await updateProposalSectionOrder(proposalId, reordered.map((s) => s.id));
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      setSections(sections); // revert on error
    }
  }, [sections, proposalId, toast]);

  if (sections.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No sections yet"
        description="Add sections to build your proposal content."
        action={{ label: 'Add Section', href: `/proposals/${proposalId}/sections/new` }}
      />
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sections.map((section, index) => (
            <SortableSectionItem
              key={section.id}
              section={section}
              index={index}
              proposalId={proposalId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
