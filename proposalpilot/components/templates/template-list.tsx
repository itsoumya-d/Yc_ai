'use client';

import { useState } from 'react';
import { TemplateCard } from './template-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';
import type { Template } from '@/types/database';

interface TemplateListProps {
  templates: Template[];
}

export function TemplateList({ templates }: TemplateListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (templates.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No templates yet"
        description="Templates will help you create proposals faster."
      />
    );
  }

  // Extract unique categories
  const categories = Array.from(
    new Set(templates.map((t) => t.category).filter(Boolean))
  ) as string[];

  const filtered = activeCategory
    ? templates.filter((t) => t.category === activeCategory)
    : templates;

  return (
    <div className="space-y-4">
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !activeCategory
                ? 'bg-blue-600 text-white'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
            }`}
          >
            All ({templates.length})
          </button>
          {categories.map((cat) => {
            const count = templates.filter((t) => t.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
