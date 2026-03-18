'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Layers, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { reorderProposalSections } from '@/lib/actions/proposal-sections';
import type { ProposalSection } from '@/types/database';

interface ProposalSectionListProps {
  sections: ProposalSection[];
  proposalId: string;
}

export function ProposalSectionList({ sections: initialSections, proposalId }: ProposalSectionListProps) {
  const [sections, setSections] = useState(initialSections);
  const [reordering, setReordering] = useState(false);
  const [improvingId, setImprovingId] = useState<string | null>(null);

  async function moveSection(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);
    setSections(newSections);

    setReordering(true);
    await reorderProposalSections(proposalId, newSections.map((s) => s.id));
    setReordering(false);
  }

  async function handleAIImprove(sectionId: string) {
    setImprovingId(sectionId);
    // Simulate AI processing — in production, call an AI action here
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setImprovingId(null);
  }

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
      {reordering && (
        <p className="text-xs text-[var(--muted-foreground)] animate-pulse">Saving order...</p>
      )}
      <AnimatePresence initial={false}>
        {sections.map((section, idx) => (
          <motion.div
            key={section.id}
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Card className="group p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
              <div className="flex items-center gap-3">
                {/* Move buttons */}
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => moveSection(idx, 'up')}
                    disabled={idx === 0 || reordering}
                    title="Move up"
                    className="rounded p-0.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move section up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveSection(idx, 'down')}
                    disabled={idx === sections.length - 1 || reordering}
                    title="Move down"
                    className="rounded p-0.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move section down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Link href={`/proposals/${proposalId}/sections/${section.id}`} className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm font-medium text-[var(--muted-foreground)] shrink-0">{idx + 1}.</span>
                  <h3 className="font-medium text-[var(--foreground)] truncate">{section.title}</h3>
                  <span className="ml-auto text-xs text-[var(--muted-foreground)] capitalize shrink-0">{section.section_type.replace('_', ' ')}</span>
                </Link>

                {/* AI Improve button */}
                <button
                  onClick={() => handleAIImprove(section.id)}
                  disabled={improvingId === section.id}
                  title="AI Improve this section"
                  className="ml-2 flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity hover:border-purple-400 hover:text-purple-600 disabled:cursor-wait shrink-0 overflow-hidden relative"
                  aria-label="AI improve section"
                >
                  {improvingId === section.id ? (
                    <>
                      {/* Shimmer overlay */}
                      <span className="absolute inset-0 -translate-x-full animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-purple-100 to-transparent" />
                      <Sparkles className="w-3 h-3 text-purple-500 animate-pulse" />
                      <span>Improving...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>AI Improve</span>
                    </>
                  )}
                </button>
              </div>

              {section.content && (
                <p className="mt-2 ml-10 text-sm text-[var(--muted-foreground)] line-clamp-2">{section.content}</p>
              )}
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
