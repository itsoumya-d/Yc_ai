import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Layers, GripVertical } from 'lucide-react';
import type { ProposalSection } from '@/types/database';

interface ProposalSectionListProps {
  sections: ProposalSection[];
  proposalId: string;
}

export function ProposalSectionList({ sections, proposalId }: ProposalSectionListProps) {
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
    <div className="space-y-2">
      {sections.map((section, idx) => (
        <Link key={section.id} href={`/proposals/${proposalId}/sections/${section.id}`}>
          <Card className="p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-[var(--muted-foreground)]">{idx + 1}.</span>
                <h3 className="font-medium text-[var(--foreground)] truncate">{section.title}</h3>
              </div>
              <span className="ml-auto text-xs text-[var(--muted-foreground)] capitalize">{section.section_type.replace('_', ' ')}</span>
            </div>
            {section.content && (
              <p className="mt-2 ml-10 text-sm text-[var(--muted-foreground)] line-clamp-2">{section.content}</p>
            )}
          </Card>
        </Link>
      ))}
    </div>
  );
}
